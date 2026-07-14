# PowerShell: run read-only SQL snapshots against your Postgres (no containers).
# Prerequisites: `psql` on PATH, DATABASE_URL set (e.g. dotenv or manual).
# Usage from Backend/:  $env:DATABASE_URL = "postgresql://..." ; .\view-data.ps1

if (-not $env:DATABASE_URL) {
    Write-Error "Set DATABASE_URL to your PostgreSQL connection string (see Backend/.env)."
    exit 1
}

Write-Host "=== SchooliAt Database Data Viewer ===" -ForegroundColor Green
Write-Host ""

function Run-Query {
    param([string]$Query, [string]$Description)
    Write-Host "`n$Description" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor Gray
    & psql $env:DATABASE_URL -c $Query
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Query failed (check DATABASE_URL and psql)."
    }
}

Run-Query "SELECT name, code, email, phone, student_strength FROM schools;" "Schools"
Run-Query "SELECT r.name as role, COUNT(u.id) as count FROM roles r LEFT JOIN users u ON r.id = u.role_id AND u.deleted_at IS NULL GROUP BY r.name ORDER BY r.name;" "Users by Role"
Run-Query "SELECT s.name as school, COUNT(sp.id) as students FROM schools s LEFT JOIN users u ON s.id = u.school_id AND u.deleted_at IS NULL LEFT JOIN student_profiles sp ON u.id = sp.user_id GROUP BY s.name;" "Students per School"
Run-Query "SELECT s.name as school, COUNT(tp.id) as teachers FROM schools s LEFT JOIN users u ON s.id = u.school_id AND u.deleted_at IS NULL LEFT JOIN teacher_profiles tp ON u.id = tp.user_id GROUP BY s.name;" "Teachers per School"
Run-Query "SELECT s.name as school, COUNT(c.id) as classes FROM schools s LEFT JOIN classes c ON s.id = c.school_id AND c.deleted_at IS NULL GROUP BY s.name;" "Classes per School"
Run-Query "SELECT s.name as school, COUNT(t.id) as vehicles FROM schools s LEFT JOIN transports t ON s.id = t.school_id AND t.deleted_at IS NULL GROUP BY s.name;" "Transport Vehicles"
Run-Query "SELECT s.name as school, COUNT(r.id) as receipts, SUM(r.amount) as total_amount FROM schools s LEFT JOIN receipts r ON s.id = r.school_id AND r.deleted_at IS NULL GROUP BY s.name;" "Receipts"
Run-Query "SELECT title, status, priority FROM grievances LIMIT 5;" "Recent Grievances"
Run-Query "SELECT name, status, contact FROM vendors;" "Vendors"
Run-Query "SELECT name, issuer, status, expiry_date FROM licenses;" "Licenses"

Write-Host "`n=== Summary ===" -ForegroundColor Green
Run-Query "SELECT 'Total Schools' as metric, COUNT(*)::text as value FROM schools UNION ALL SELECT 'Total Users', COUNT(*)::text FROM users WHERE deleted_at IS NULL UNION ALL SELECT 'Total Students', COUNT(*)::text FROM student_profiles UNION ALL SELECT 'Total Teachers', COUNT(*)::text FROM teacher_profiles UNION ALL SELECT 'Total Classes', COUNT(*)::text FROM classes WHERE deleted_at IS NULL UNION ALL SELECT 'Total Transports', COUNT(*)::text FROM transports WHERE deleted_at IS NULL;" "Database Summary"

Write-Host "`nInteractive psql:" -ForegroundColor Yellow
Write-Host "  psql `$env:DATABASE_URL" -ForegroundColor White
