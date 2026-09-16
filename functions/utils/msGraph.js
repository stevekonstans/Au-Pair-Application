export async function appendToExcel(formData, env) {
    const tenantId = env.MS_TENANT_ID?.trim();
    const clientId = env.MS_CLIENT_ID?.trim();
    const clientSecret = env.MS_CLIENT_SECRET?.trim();
    const excelFileName = (env.MS_EXCEL_FILE_NAME || 'AuPairApplication.xlsx').trim();
    const userEmail = (env.MS_USER_PRINCIPAL_NAME || env.ADMIN_EMAIL || 'info@anixi.se').trim();

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Microsoft Graph API credentials are not fully configured.');
    }

    // 1. Get Access Token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
        client_id: clientId,
        scope: 'https://graph.microsoft.com/.default',
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    });

    const tokenRes = await fetch(tokenUrl, { method: 'POST', body: params });
    const tokenData = await tokenRes.json();
    
    if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`Failed to authenticate with MS Graph: ${JSON.stringify(tokenData)}`);
    }
    
    const token = tokenData.access_token;

    // 2. Discover available Drive (SharePoint / OneDrive for Business document library)
    let driveId = env.MS_DRIVE_ID?.trim() || null;
    if (!driveId) {
        try {
            const drivesRes = await fetch('https://graph.microsoft.com/v1.0/drives', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (drivesRes.ok) {
                const drivesData = await drivesRes.json();
                if (drivesData.value && drivesData.value.length > 0) {
                    driveId = drivesData.value[0].id;
                }
            }
        } catch (e) {
            console.warn('Could not query /drives:', e);
        }
    }

    // Candidate file paths (specifically targeting AuPairApplication.xlsx)
    const baseName = excelFileName.replace(/^\/+/, '');
    const candidatePaths = [
        env.MS_EXCEL_FILE_PATH?.trim().replace(/^\/+/, ''),
        `ANIXI/APPLICANTS/USA/${baseName}`,
        `ANIXI/APPLICANTS/USA/AuPairApplication.xlsx`,
        `ANIXI/APPLICANTS/${baseName}`,
        `ANIXI/APPLICANTS/AuPairApplication.xlsx`,
        baseName,
        'AuPairApplication.xlsx'
    ].filter(Boolean);

    const uniquePaths = [...new Set(candidatePaths)];
    let itemBaseUrl = null;
    let resolvedFilePath = null;
    let attemptedEndpoints = [];

    // Helper to check if workbook endpoint works for a given URL
    async function checkWorkbook(url) {
        const testRes = await fetch(`${url}/workbook/worksheets`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return testRes.ok;
    }

    // 3. Search via Drive ID if available
    if (driveId) {
        for (const pathCandidate of uniquePaths) {
            const targetUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURI(pathCandidate)}`;
            attemptedEndpoints.push(`drive:${pathCandidate}`);
            try {
                const res = await fetch(targetUrl, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const item = await res.json();
                    if (item && item.id) {
                        const wbUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${item.id}/workbook`;
                        const works = await checkWorkbook(`https://graph.microsoft.com/v1.0/drives/${driveId}/items/${item.id}`);
                        if (works) {
                            itemBaseUrl = wbUrl;
                            resolvedFilePath = pathCandidate;
                            break;
                        }
                    }
                }
            } catch (err) {
                // continue
            }
        }
    }

    // 4. Fallback search via User's personal OneDrive if userEmail is set
    if (!itemBaseUrl && userEmail) {
        for (const pathCandidate of uniquePaths) {
            const targetUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/drive/root:/${encodeURI(pathCandidate)}`;
            attemptedEndpoints.push(`user:${pathCandidate}`);
            try {
                const res = await fetch(targetUrl, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                    const item = await res.json();
                    if (item && item.id) {
                        const wbUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/drive/items/${item.id}/workbook`;
                        const works = await checkWorkbook(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/drive/items/${item.id}`);
                        if (works) {
                            itemBaseUrl = wbUrl;
                            resolvedFilePath = pathCandidate;
                            break;
                        }
                    }
                }
            } catch (err) {
                // continue
            }
        }
    }

    if (!itemBaseUrl) {
        throw new Error(`Kunde inte hitta Excel-filen i OneDrive för ${userEmail}. Provade sökvägar: [${uniquePaths.join(', ')}]. Kontrollera att filen heter AuPairApplication.xlsx och ligger i ANIXI/APPLICANTS/USA/ eller i roten.`);
    }

    // 5. Find existing Table
    const tablesUrl = `${itemBaseUrl}/tables`;
    const tablesRes = await fetch(tablesUrl, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!tablesRes.ok) {
        const err = await tablesRes.json();
        throw new Error(`Kunde inte läsa tabeller i Excel-filen: ${err.error?.message || JSON.stringify(err)}`);
    }

    const tablesData = await tablesRes.json();
    let tableId = null;
    
    if (tablesData.value && tablesData.value.length > 0) {
        tableId = tablesData.value[0].id;
    }

    // 6. Create a Table if one doesn't exist
    if (!tableId) {
        const sheetsRes = await fetch(`${itemBaseUrl}/worksheets`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const sheetsData = await sheetsRes.json();
        
        if (!sheetsData.value || sheetsData.value.length === 0) {
            throw new Error("Inga kalkylblad hittades i Excel-filen.");
        }
        
        const sheet = sheetsData.value[0];
        const sheetName = sheet.name || 'Sheet1';

        // Set headers first
        const headers = [
            "Date", "Ref ID", "Full Name", "Email", "Phone", "DOB", "Nationality", "Country", "Gender",
            "Destination Country", "Stay Duration", "Earliest Travel Date", "Drivers License", "Swimming Skills",
            "Childcare Ages", "Status", "Submission Time"
        ];
        await fetch(`${itemBaseUrl}/worksheets/${sheet.id}/range(address='A1:Q1')`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [headers] })
        });

        const createTableRes = await fetch(`${itemBaseUrl}/worksheets/${sheet.id}/tables/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: `${sheetName}!A1:Q1`, hasHeaders: true })
        });
        
        if (createTableRes.ok) {
            const newTable = await createTableRes.json();
            tableId = newTable.id;
        } else {
            // Re-fetch tables in case it was created concurrently
            const refetchRes = await fetch(tablesUrl, { headers: { Authorization: `Bearer ${token}` } });
            const refetchData = await refetchRes.json();
            if (refetchData.value && refetchData.value.length > 0) {
                tableId = refetchData.value[0].id;
            }
        }
    }

    // 7. Add the Row to Table
    const childcareExp = Array.isArray(formData.childcareAgeExperience)
        ? formData.childcareAgeExperience.join(', ')
        : (formData.childcareAgeExperience || '');

    const rowValues = [[
        new Date().toISOString().split('T')[0],
        formData.applicationId || `ANX-${Date.now().toString(36).toUpperCase()}`,
        formData.fullName || '',
        formData.email || '',
        formData.phone || '',
        formData.dateOfBirth || formData.birthDate || '',
        formData.nationality || '',
        formData.country || '',
        formData.gender || '',
        formData.applyingCountry || 'USA',
        formData.stayDuration || '',
        formData.earliestTravelDate || formData.earliestDeparture || '',
        formData.driversLicense || '',
        formData.swimmingSkills || '',
        childcareExp,
        'Mottagen',
        new Date().toISOString()
    ]];

    const addRowRes = await fetch(`${itemBaseUrl}/tables/${tableId}/rows/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rowValues })
    });

    if (!addRowRes.ok) {
        const err = await addRowRes.json();
        throw new Error(`Kunde inte lägga till rad i Excel: ${err.error?.message || JSON.stringify(err)}`);
    }
    
    return { success: true, filePath: resolvedFilePath };
}
