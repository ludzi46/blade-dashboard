const calculateButton =
    document.getElementById('calculateButton');

const tableBody =
    document.getElementById('incidentTableBody');

const startDate =
    document.getElementById('startDate');

const endDate =
    document.getElementById('endDate');

const severity =
    document.getElementById('severity');

const threatClassification =
    document.getElementById('threatClassification');

const alertVerdict =
    document.getElementById('alertVerdict');


function displayResults(data) {

    tableBody.innerHTML = '';

    if (data.length === 0) {

        const row = document.createElement('tr');

        row.innerHTML = `
            <td colspan="2">
                No incidents found.
            </td>
        `;

        tableBody.appendChild(row);

        return;
    }

    // Za racunanje koliko moze da stane redova na ekranu.
    const rowHeight = 35;
    const reservedHeight = 260;

    const availableHeight =
        window.innerHeight - reservedHeight;

    const maxRows =
        Math.max(
            1,
            Math.floor(availableHeight / rowHeight)
        );

     // Prikaz samo koliko moze da stane na ekranu. Bez skrolovanja
    const visibleData =
        data.slice(0, maxRows);

    visibleData.forEach(item => {

        const row =
            document.createElement('tr');

        row.innerHTML = `
            <td>${item.minute}</td>
            <td>${item.incident_count}</td>
        `;

        tableBody.appendChild(row);
    });
}


async function loadIncidents() {

    try {

        const start = startDate.value;
        const end = endDate.value;

        // Datum i vrijeme
        if (start && end && start > end) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="2">
                        End date must be greater than or equal to start date.
                    </td>
                </tr>
            `;

            return;
        }

        calculateButton.disabled = true;
        calculateButton.textContent = 'Calculating...';

        let url = 'api.php';

        const params =
            new URLSearchParams();


        if (start && end) {

            params.append(
                'start_date',
                start
            );

            params.append(
                'end_date',
                end
            );
        }


        if (severity.value) {

            params.append(
                'severity',
                severity.value
            );
        }


        if (threatClassification.value) {

            params.append(
                'threat_classification',
                threatClassification.value
            );
        }


        if (alertVerdict.value) {

            params.append(
                'alert_verdict',
                alertVerdict.value
            );
        }


        if (params.toString()) {

            url += `?${params.toString()}`;

        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                'Server error'
            );

        }


        const data =
            await response.json();


        // Prikaz rezultata
        displayResults(data);


    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="2">
                    Unable to load incident data. Please try again.
                </td>
            </tr>
        `;

    } finally {

        calculateButton.disabled = false;

        calculateButton.textContent =
            'Calculate incidents';

    }
}


// Za prikaz samo kada se klikne "calculatebutton"
calculateButton.addEventListener(
    'click',
    loadIncidents
);