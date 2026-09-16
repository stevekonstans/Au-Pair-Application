export async function appendToExcel(formData: any, env: any) {
    const tenantId = env.MS_TENANT_ID;
    const clientId = env.MS_CLIENT_ID;
    const clientSecret = env.MS_CLIENT_SECRET;
    const excelFileName = env.MS_EXCEL_FILE_NAME || 'AuPairApplication.xlsx';
    const userEmail = env.MS_USER_PRINCIPAL_NAME || env.ADMIN_EMAIL || 'info@anixi.se';

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Microsoft Graph API credentials are not fully configured in the environment.');
    }

    try {
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

        // 2. Find existing Table in the Excel File
        const tablesUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${excelFileName}:/workbook/tables`;
        const tablesRes = await fetch(tablesUrl, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (!tablesRes.ok) {
            const err = await tablesRes.json();
            throw new Error(`Could not access Excel file. Please ensure a blank Excel file named "${excelFileName}" exists in the root of ${userEmail}'s OneDrive. Error: ${err.error?.message || JSON.stringify(err)}`);
        }

        const tablesData = await tablesRes.json();
        let tableId;
        
        if (tablesData.value && tablesData.value.length > 0) {
            tableId = tablesData.value[0].id;
        }

        // 3. Create a Table if one doesn't exist
        if (!tableId) {
            // Get the first worksheet
            const sheetsRes = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${excelFileName}:/workbook/worksheets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sheetsData = await sheetsRes.json();
            
            if (!sheetsData.value || sheetsData.value.length === 0) {
                throw new Error("No worksheets found in the Excel file.");
            }
            
            const sheetName = sheetsData.value[0].name;

            // Add Table
            const createTableUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${excelFileName}:/workbook/worksheets/${sheetsData.value[0].id}/tables/add`;
            const createTableRes = await fetch(createTableUrl, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: `${sheetName}!A1:I1`, hasHeaders: true })
            });
            
            const newTable = await createTableRes.json();
            tableId = newTable.id;

            // Set Headers
            await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${excelFileName}:/workbook/tables/${tableId}/headerRowRange`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    values: [["Datum", "Namn", "Email", "Telefon", "Ort", "Körkort", "Studier", "Avresa", "Status"]]
                })
            });
        }

        // 4. Add the Row
        const rowValues = [[
            new Date().toISOString().split('T')[0],
            formData.fullName || '',
            formData.email || '',
            formData.phone || '',
            formData.city || '',
            formData.driversLicense || '',
            formData.childcareStudies || '',
            formData.earliestDeparture || 'Flexibel',
            'Ny'
        ]];

        const addRowRes = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${excelFileName}:/workbook/tables/${tableId}/rows/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: rowValues })
        });

        if (!addRowRes.ok) {
            const err = await addRowRes.json();
            throw new Error(`Failed to insert row: ${err.error?.message || JSON.stringify(err)}`);
        }
        
        return { success: true };
    } catch (error: any) {
        console.error("Microsoft Graph Error:", error);
        throw error;
    }
}
