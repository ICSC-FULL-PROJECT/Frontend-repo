// SheetJS must be loaded before this file
// <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

const ExcelParser = {
    parse(file, callback) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);

            try {
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Extract real JSON data
                const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                callback(json);

            } catch (err) {
                console.error("Excel parsing error:", err);
                alert("Invalid Excel file format.");
            }
        };

        reader.readAsArrayBuffer(file);
    },

    renderPreview(data, containerId) {
        const previewContainer = document.getElementById(containerId);
        if (!previewContainer) return;

        if (!data || data.length === 0) {
            previewContainer.innerHTML = "<p>No data found in Excel file.</p>";
            previewContainer.style.display = "block";
            return;
        }

        const headers = Object.keys(data[0]);

        let html = `<table class="data-table"><thead><tr>`;
        headers.forEach(h => html += `<th>${h}</th>`);
        html += `</tr></thead><tbody>`;

        data.forEach(row => {
            html += `<tr>`;
            headers.forEach(h => {
                html += `<td>${row[h]}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;

        previewContainer.innerHTML = html;
        previewContainer.style.display = "block";
    }
};
