<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'database.php';

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;
$severity = $_GET['severity'] ?? null;
$threatClassification = $_GET['threat_classification'] ?? null;
$alertVerdict = $_GET['alert_verdict'] ?? null;


$sql = "
    SELECT
        DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:00') AS minute,
        COUNT(*) AS incident_count
    FROM incidents i
    JOIN incidents_ai ia
        ON i.id = ia.incident_id
    WHERE 1 = 1
";

$params = [];


/* DATE FILTER */

if ($startDate && $endDate) {

    $sql .= "
        AND i.created_at >= :start_date
        AND i.created_at < DATE_ADD(:end_date, INTERVAL 1 DAY)
    ";

    $params['start_date'] = $startDate;
    $params['end_date'] = $endDate;
}


/* SEVERITY FILTER */

if ($severity) {

    $sql .= "
        AND ia.ai_analysis LIKE :severity
    ";

    $params['severity'] = "%Severity: $severity%";
}


/* THREAT CLASSIFICATION FILTER */

if ($threatClassification) {

    $sql .= "
        AND ia.ai_analysis LIKE :threat_classification
    ";

    $params['threat_classification'] =
        "%Threat Classification: $threatClassification%";
}


/* ALERT VERDICT FILTER */

if ($alertVerdict) {

    $sql .= "
        AND ia.ai_analysis LIKE :alert_verdict
    ";

    $params['alert_verdict'] =
        "%Alert Verdict: $alertVerdict%";
}


$sql .= "
    GROUP BY DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:00')
    ORDER BY incident_count DESC
";


try {

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $results = $stmt->fetchAll();

    echo json_encode($results);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'error' => 'Database query failed.'
    ]);
}