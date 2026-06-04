import pandas as pd
import numpy as np
import os
import zipfile

def main():
    # Ensure sample_data directory exists
    os.makedirs("sample_data", exist_ok=True)
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # File paths
    metrics_path = "sample_data/metrics.csv"
    deploy_log_path = "sample_data/deployment_log.txt"
    db_log_path = "sample_data/db_error_logs.txt"
    tickets_path = "sample_data/support_tickets.txt"
    zip_path = "sample_data/blackfriday_incident.zip"
    
    # =========================================================================
    # FILE 1: metrics.csv
    # =========================================================================
    # 72 hours of 5-minute intervals = 72 * 12 = 864 rows
    # 2024-11-29 00:00 UTC to 2024-12-01 00:00 UTC (exclusive of end to get exactly 864 rows)
    timestamps = pd.date_range("2024-11-29 00:00:00", periods=864, freq="5min", tz="UTC")
    
    df = pd.DataFrame(index=range(864))
    df["timestamp"] = [t.strftime("%Y-%m-%dT%H:%M:%SZ") for t in timestamps]
    
    # Base regions
    regions = ["East", "West", "North", "South"]
    df["region"] = np.random.choice(regions, size=864)
    
    # Incident window: 2024-11-30 02:10 UTC to 2024-11-30 03:45 UTC (inclusive)
    incident_start = pd.Timestamp("2024-11-30 02:10:00", tz="UTC")
    incident_end = pd.Timestamp("2024-11-30 03:45:00", tz="UTC")
    
    # Force some key timestamps to be East region to guarantee incident representation
    # and alternate other timestamps to maintain comparison with normal regions.
    for idx, t in enumerate(timestamps):
        if incident_start <= t <= incident_end:
            offset_mins = int((t - incident_start).total_seconds() / 60)
            if offset_mins in [0, 5, 10, 15, 80, 95]:
                # Force "East" on key events (start, error rate jump, peak error rate, peak latency, db connections drop, recovery end)
                df.loc[idx, "region"] = "East"
            elif offset_mins in [20, 30, 40, 50, 60, 70, 90]:
                df.loc[idx, "region"] = "East"
            elif offset_mins in [25, 45, 65, 85]:
                df.loc[idx, "region"] = "West"
            elif offset_mins in [35, 75]:
                df.loc[idx, "region"] = "North"
            else:
                df.loc[idx, "region"] = "South"
                
    # Normal metrics (noise addition)
    # checkout_latency_ms: normally ~220ms with ±30ms noise
    checkout_latency = np.random.normal(220, 15, size=864)
    # order_volume: normally ~340 per 5-min window with ±40 noise
    order_volume = np.random.normal(340, 20, size=864)
    # error_rate_pct: normally ~0.4% with ±0.1 noise
    error_rate = np.random.normal(0.4, 0.05, size=864)
    # db_connections: normally ~45 active connections with ±5 noise
    db_connections = np.random.normal(45, 2.5, size=864)
    
    df["checkout_latency_ms"] = checkout_latency
    df["order_volume"] = order_volume
    df["error_rate_pct"] = error_rate
    df["db_connections"] = db_connections
    
    # Overwrite East region metrics during the incident window
    for idx, t in enumerate(timestamps):
        if incident_start <= t <= incident_end and df.loc[idx, "region"] == "East":
            offset_mins = int((t - incident_start).total_seconds() / 60)
            
            # db_connections: spikes to 500 at 02:11, stays at 500 until 03:30, then drops back
            if 0 <= offset_mins < 5:  # 02:10 (before the 02:11 spike)
                db_conn = np.random.normal(45, 2.5)
            elif 5 <= offset_mins <= 80:  # 02:15 to 03:30 (hard limit hit)
                db_conn = 500.0
            elif offset_mins == 85:  # 03:35 (dropping back)
                db_conn = 350.0
            elif offset_mins == 90:  # 03:40
                db_conn = 200.0
            elif offset_mins == 95:  # 03:45
                db_conn = 80.0
            else:
                db_conn = np.random.normal(45, 2.5)
            df.loc[idx, "db_connections"] = db_conn
            
            # checkout_latency_ms: spikes from 220 to 8400 (peaks at 02:25), then slowly recovers to 950 by 03:45
            if offset_mins == 0:  # 02:10
                lat = 1200.0 + np.random.normal(0, 10)
            elif offset_mins == 5:  # 02:15
                lat = 4500.0 + np.random.normal(0, 20)
            elif offset_mins == 10:  # 02:20
                lat = 7200.0 + np.random.normal(0, 20)
            elif offset_mins == 15:  # 02:25 (peak)
                lat = 8400.0
            else:  # 02:30 to 03:45 (offset_mins 20 to 95)
                # Linear recovery from 8400 (at offset 15) to 950 (at offset 95)
                step = (offset_mins - 15) // 5
                lat = 8400.0 - step * (8400.0 - 950.0) / 16.0 + np.random.normal(0, 15)
            df.loc[idx, "checkout_latency_ms"] = lat
            
            # order_volume: drops from 340 to 12 (near-zero) during the spike window
            if offset_mins == 0:  # 02:10
                vol = 150.0 + np.random.normal(0, 10)
            elif offset_mins == 5:  # 02:15
                vol = 40.0 + np.random.normal(0, 5)
            elif 10 <= offset_mins <= 80:  # 02:20 to 03:30 (near-zero)
                vol = max(2.0, np.random.normal(12, 2))
            elif offset_mins == 85:  # 03:35
                vol = 60.0 + np.random.normal(0, 8)
            elif offset_mins == 90:  # 03:40
                vol = 160.0 + np.random.normal(0, 12)
            elif offset_mins == 95:  # 03:45
                vol = 280.0 + np.random.normal(0, 15)
            else:
                vol = np.random.normal(340, 20)
            df.loc[idx, "order_volume"] = vol
            
            # error_rate_pct: jumps from 0.4% to 34.7% at 02:14 (visible at 02:15), peaks at 67.2% at 02:20
            if offset_mins == 0:  # 02:10
                err = 0.4 + np.random.normal(0, 0.05)
            elif offset_mins == 5:  # 02:15
                err = 34.7 + np.random.normal(0, 0.2)
            elif offset_mins == 10:  # 02:20 (peak)
                err = 67.2 + np.random.normal(0, 0.2)
            else:  # 02:25 to 03:45 (offset 15 to 95)
                # Interpolate from 67.2% to 0.4% (at 03:50, which is step 18)
                step = (offset_mins - 10) // 5
                err = 67.2 - step * (67.2 - 0.4) / 18.0 + np.random.normal(0, 0.3)
            df.loc[idx, "error_rate_pct"] = err

    # Round columns appropriately
    df["checkout_latency_ms"] = df["checkout_latency_ms"].round(2)
    df["order_volume"] = df["order_volume"].round().astype(int)
    df["error_rate_pct"] = df["error_rate_pct"].round(3)
    df["db_connections"] = df["db_connections"].round().astype(int)
    
    # Apply Data Quality Issues
    # 1. 12 random rows across the file should have null values in 1-2 columns
    null_indices = np.random.choice(df.index, size=12, replace=False)
    cols_to_null = ["checkout_latency_ms", "order_volume", "error_rate_pct", "db_connections"]
    
    # Cast columns to float/object as needed to support None/NaN
    df = df.astype({"checkout_latency_ms": object, "order_volume": object, "error_rate_pct": object, "db_connections": object})
    
    for idx in null_indices:
        num_cols = np.random.choice([1, 2])
        chosen_cols = np.random.choice(cols_to_null, size=num_cols, replace=False)
        df.loc[idx, chosen_cols] = None
        
    # 2. 3 rows should have checkout_latency_ms as a string like "8423ms" instead of a float
    valid_lat_indices = df[df["checkout_latency_ms"].notnull()].index
    # Exclude indices that were set to null or duplicate candidates
    str_indices = np.random.choice(valid_lat_indices, size=3, replace=False)
    for idx in str_indices:
        val = df.loc[idx, "checkout_latency_ms"]
        df.loc[idx, "checkout_latency_ms"] = f"{int(round(float(val)))}ms"
        
    # 3. Duplicate 5 rows exactly
    dup_indices = np.random.choice(df.index, size=5, replace=False)
    dup_rows = df.loc[dup_indices].copy()
    df = pd.concat([df, dup_rows], ignore_index=True)
    
    # 4. 2 rows should have timestamps in a different format: "30/11/2024 02:15"
    # Choose from the first 864 rows to ensure original timestamps are validly mapped
    ts_indices = np.random.choice(range(864), size=2, replace=False)
    for idx in ts_indices:
        orig_ts = pd.to_datetime(df.loc[idx, "timestamp"])
        df.loc[idx, "timestamp"] = orig_ts.strftime("%d/%m/%Y %H:%M")
        
    # Write metrics.csv
    df.to_csv(metrics_path, index=False)
    
    # =========================================================================
    # FILE 2: deployment_log.txt
    # =========================================================================
    deployment_log_content = """[2024-11-29 07:45:00 UTC] INFO  System cron job: cleanup_sessions completed. Deleted 1,240 expired sessions.
[2024-11-29 08:00:00 UTC] INFO  Checking repository for new release tags... Found v4.7.2.
[2024-11-29 08:03:12 UTC] INFO  Deploy pipeline started. Build: v4.7.2
[2024-11-29 08:04:55 UTC] INFO  Unit tests passed. Coverage: 94.2%
[2024-11-29 08:06:01 UTC] INFO  Staging deployment complete.
[2024-11-29 08:15:33 UTC] INFO  Staging health check: OK. CPU load: 12%, Memory: 42%.
[2024-11-29 09:00:00 UTC] INFO  Staging container registry warmed up. 8 active containers.
[2024-11-29 09:22:14 UTC] INFO  Load test on staging: PASSED. p99=312ms.
[2024-11-29 10:30:15 UTC] INFO  Syncing static assets to CDN. 42 files updated.
[2024-11-29 12:00:00 UTC] INFO  Staging verification checklist completed by QA team.
[2024-11-29 14:00:00 UTC] INFO  Production deployment window opened.
[2024-11-29 15:45:12 UTC] INFO  Pre-release checks complete. Release engineer approved deployment.
[2024-11-29 18:30:00 UTC] INFO  Backup of production database 'meshloop_prod' completed successfully. Size: 1.2 TB.
[2024-11-29 19:15:22 UTC] INFO  Preparing canary deployment. Target: EAST region.
[2024-11-29 19:55:00 UTC] INFO  Canary deployment traffic routing set to 5%.
[2024-11-29 20:09:33 UTC] WARN  Config override applied: db.connection_pool.max=500 (previous value: 50). Reason: Black Friday scaling.
[2024-11-29 20:09:33 UTC] WARN  NOTE: connection_pool.max=500 applies to pool SIZE LIMIT, not pre-allocated connections. Pool only grows on demand under sustained load.
[2024-11-29 20:09:41 UTC] INFO  Config change deployed to EAST region first.
[2024-11-29 20:10:02 UTC] INFO  Config change deployed to WEST, NORTH, SOUTH.
[2024-11-29 20:11:30 UTC] INFO  Deployment v4.7.2 complete. All regions healthy.
[2024-11-29 20:12:15 UTC] INFO  Post-deploy verification checks running...
[2024-11-29 20:13:02 UTC] INFO  All smoke tests passed for version v4.7.2.
[2024-11-29 20:14:00 UTC] INFO  Black Friday traffic monitoring activated.
[2024-11-29 21:00:00 UTC] INFO  Hourly traffic report - Total sessions: 84,200, Active orders: 3,120.
[2024-11-29 22:00:00 UTC] INFO  CDN edge caches reported 98.4% hit rate.
[2024-11-29 23:00:00 UTC] INFO  Traffic nominal. Peak order volume: 1,240/min.
[2024-11-29 23:30:00 UTC] INFO  Security scanner: 0 high, 2 low vulnerabilities found. Next scan in 24 hours.
"""
    with open(deploy_log_path, "w", encoding="utf-8") as f:
        f.write(deployment_log_content)
        
    # =========================================================================
    # FILE 3: db_error_logs.txt
    # =========================================================================
    events = []
    
    def add_log(ts_str, level, service, msg, server=None, pid=None, is_pg=False):
        ts = pd.Timestamp(ts_str, tz="UTC")
        if is_pg:
            line = f"{ts.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]} UTC [{pid}] postgres@meshloop_prod {level}:  {msg}"
        else:
            server_suffix = f" - {server}" if server else ""
            line = f"[{ts.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]} UTC] {level:<5} [{service}] {msg}{server_suffix}"
        events.append((ts, line))
        
    # Normal usage warnings (01:50 to 02:08)
    add_log("2024-11-30 01:50:22.104", "WARN", "HikariPool-1", "Connection pool usage at 78% (35/45 active)", "app-server-east-01")
    add_log("2024-11-30 01:51:15.802", "INFO", "system", "Garbage collection completed. GC time: 142ms. Heap freed: 340MB.")
    add_log("2024-11-30 01:52:10.551", "WARN", "HikariPool-1", "Connection pool usage at 42% (19/45 active)", "app-server-west-01")
    add_log("2024-11-30 01:55:05.903", "WARN", "HikariPool-1", "Connection pool usage at 82% (37/45 active)", "app-server-east-02")
    add_log("2024-11-30 01:58:14.214", "WARN", "HikariPool-1", "Connection pool usage at 35% (16/45 active)", "app-server-north-01")
    add_log("2024-11-30 02:00:00.012", "DEBUG", "db-client", "Heartbeat ping success. Latency: 1.8ms", "app-server-east-01")
    add_log("2024-11-30 02:01:44.664", "WARN", "HikariPool-1", "Connection pool usage at 89% (40/45 active)", "app-server-east-03")
    add_log("2024-11-30 02:04:12.712", "WARN", "HikariPool-1", "Connection pool usage at 87% (39/45 active)", "app-server-east-01")
    add_log("2024-11-30 02:05:00.002", "INFO", "monitor", "Routine heartbeat log: db pool status OK", "app-server-east-04")
    add_log("2024-11-30 02:06:33.411", "WARN", "HikariPool-1", "Connection pool usage at 48% (22/45 active)", "app-server-south-02")
    add_log("2024-11-30 02:08:15.908", "WARN", "HikariPool-1", "Connection pool usage at 88% (40/45 active)", "app-server-east-04")
    add_log("2024-11-30 02:09:30.124", "DEBUG", "system", "Routine memory usage: heap 62%, non-heap 44%", "app-server-east-01")
    
    # 02:11:03: first "connection pool exhausted" error on EAST region app-server-east-01
    add_log("2024-11-30 02:11:03.142", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 15", "app-server-east-01")
    
    # 02:11:07 to 02:14: rapid escalation — same error on app-server-east-02, 03, 04
    add_log("2024-11-30 02:11:07.882", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 22", "app-server-east-02")
    add_log("2024-11-30 02:11:45.312", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 41", "app-server-east-03")
    add_log("2024-11-30 02:12:12.904", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 50", "app-server-east-04")
    add_log("2024-11-30 02:12:55.105", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 80", "app-server-east-01")
    add_log("2024-11-30 02:13:30.412", "ERROR", "checkout-service", "Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: 110", "app-server-east-02")
    
    # 02:14:31: "FATAL: remaining connection slots are reserved for replication"
    add_log("2024-11-30 02:14:31.912", "FATAL", "", "remaining connection slots are reserved for replication", pid=12041, is_pg=True)
    
    # 02:15 to 03:28: sustained pool exhaustion errors every 30 seconds
    # First checkout service timeout at exactly 02:16:00
    add_log("2024-11-30 02:16:00.102", "WARN", "gateway-service", "checkout service timeout after 8000ms", "app-server-east-01")
    
    # Pool exhaustion 02:15 to 02:45: every 45 seconds
    t = pd.Timestamp("2024-11-30 02:15:00", tz="UTC")
    while t < pd.Timestamp("2024-11-30 02:45:00", tz="UTC"):
        ms = np.random.randint(100, 900)
        ts_str = f"{t.strftime('%Y-%m-%d %H:%M:%S')}.{ms:03d}"
        srv = np.random.choice(["app-server-east-01", "app-server-east-02", "app-server-east-03", "app-server-east-04"])
        pending = np.random.randint(120, 450)
        add_log(ts_str, "ERROR", "checkout-service", f"Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: {pending}", srv)
        t += pd.Timedelta(seconds=45)
        
    # Pool exhaustion 02:45 to 03:28: every 120 seconds
    t = pd.Timestamp("2024-11-30 02:45:00", tz="UTC")
    while t <= pd.Timestamp("2024-11-30 03:28:00", tz="UTC"):
        ms = np.random.randint(100, 900)
        ts_str = f"{t.strftime('%Y-%m-%d %H:%M:%S')}.{ms:03d}"
        srv = np.random.choice(["app-server-east-01", "app-server-east-02", "app-server-east-03", "app-server-east-04"])
        pending = np.random.randint(50, 200)
        add_log(ts_str, "ERROR", "checkout-service", f"Connection pool exhausted. Cannot acquire connection after 5000ms. Active: 45, Pending: {pending}", srv)
        t += pd.Timedelta(seconds=120)
        
    # Checkout service timeouts: every 4 minutes starting 02:20:00
    t = pd.Timestamp("2024-11-30 02:20:00", tz="UTC")
    while t <= pd.Timestamp("2024-11-30 03:28:00", tz="UTC"):
        ms = np.random.randint(100, 900)
        ts_str = f"{t.strftime('%Y-%m-%d %H:%M:%S')}.{ms:03d}"
        srv = np.random.choice(["app-server-east-01", "app-server-east-02", "app-server-east-03", "app-server-east-04"])
        add_log(ts_str, "WARN", "gateway-service", "checkout service timeout after 8000ms", srv)
        t += pd.Timedelta(minutes=4)
        
    # PostgreSQL too many clients: every 7 minutes starting 02:17:00
    t = pd.Timestamp("2024-11-30 02:17:00", tz="UTC")
    while t <= pd.Timestamp("2024-11-30 03:28:00", tz="UTC"):
        ms = np.random.randint(100, 900)
        ts_str = f"{t.strftime('%Y-%m-%d %H:%M:%S')}.{ms:03d}"
        pid = np.random.randint(12000, 13000)
        add_log(ts_str, "FATAL", "", "sorry, too many clients already", pid=pid, is_pg=True)
        t += pd.Timedelta(minutes=7)
        
    # Recovery period (03:28 to 04:00)
    add_log("2024-11-30 03:28:12.441", "INFO", "checkout-service", "Connection pool traffic throttling active. Active connections: 412", "app-server-east-01")
    add_log("2024-11-30 03:30:05.102", "WARN", "HikariPool-1", "Pool status: active=350, idle=0, max=500", "app-server-east-03")
    add_log("2024-11-30 03:32:45.891", "INFO", "checkout-service", "Active connection count decreasing. Active: 240", "app-server-east-02")
    add_log("2024-11-30 03:36:12.115", "DEBUG", "db-client", "Releasing idle connections. Active: 180, Idle: 12", "app-server-east-04")
    add_log("2024-11-30 03:40:02.904", "INFO", "checkout-service", "Active connections: 110", "app-server-east-01")
    add_log("2024-11-30 03:44:18.904", "INFO", "checkout-service", "connection pool below threshold, recovery mode", "app-server-east-01")
    add_log("2024-11-30 03:46:12.115", "INFO", "checkout-service", "Re-establishing database pool session bounds. Active: 75, Idle: 10", "app-server-east-02")
    add_log("2024-11-30 03:48:30.501", "DEBUG", "db-client", "Connection pool health check successful. Active: 60", "app-server-east-03")
    add_log("2024-11-30 03:51:02.312", "INFO", "checkout-service", "Normal pool levels restored on all East servers. Active: 44, Idle: 6", "app-server-east-01")
    add_log("2024-11-30 03:55:00.124", "DEBUG", "db-client", "Connection pool usage at 44% (20/45 active)", "app-server-east-02")
    add_log("2024-11-30 04:00:00.000", "INFO", "system-monitor", "All services operating within normal parameters. All clear.")
    
    # Sort and write to file
    events.sort(key=lambda x: x[0])
    db_error_logs_content = "\n".join([line for ts, line in events]) + "\n"
    
    with open(db_log_path, "w", encoding="utf-8") as f:
        f.write(db_error_logs_content)
        
    # =========================================================================
    # FILE 4: support_tickets.txt
    # =========================================================================
    support_tickets_content = """TICKET #10482 | 2024-11-30 02:17:34 UTC | Priority: HIGH | Region: East
Customer: Aarav Sharma
Issue: I have been trying to complete my purchase for the last 10 minutes but the page just keeps loading and eventually times out. I am trying to buy a laptop worth ₹54,999 and the discount might expire soon. Please help me complete this order as soon as possible.
Agent Notes: Customer is experiencing gateway timeout on checkout.
Status: Open
---
TICKET #10483 | 2024-11-30 02:22:15 UTC | Priority: HIGH | Region: East
Customer: Priya Patel
Issue: My payment of ₹12,500 for the Black Friday sale items was debited from my bank account, but I did not receive any order confirmation. The screen showed an error message saying database connection failed. I need either the order confirmation or a refund immediately.
Agent Notes: User reports database connection failure error on checkout page.
Status: Open
---
TICKET #10484 | 2024-11-30 02:30:11 UTC | Priority: MEDIUM | Region: West
Customer: Rohan Mehta
Issue: I cannot add items to my shopping cart. It shows a spinning wheel for a long time. Is the site down for the sale? I want to buy a smartphone for ₹18,999.
Agent Notes: West region servers are healthy; customer's local network latency resolved after page refresh.
Status: Resolved
---
TICKET #10485 | 2024-11-30 02:45:50 UTC | Priority: HIGH | Region: East
Customer: Ananya Iyer
Issue: Your payment gateway seems to be broken. I tried paying ₹3,499 three times using UPI but it keeps saying 'Service Unavailable' at the checkout step. My bank app says the transaction failed on the merchant side.
Agent Notes: Checkout service failure in East region is preventing payment requests from being processed.
Status: Open
---
TICKET #10486 | 2024-11-30 03:15:10 UTC | Priority: HIGH | Region: East
Customer: Vikram Singh
Issue: I am trying to checkout my cart containing home appliances worth ₹28,750. Every time I click 'Place Order', it shows an error 'Checkout service timed out (504)'. I have tried multiple browsers and cleared cache but nothing works.
Agent Notes: Sustained checkout latency and timeout errors reported.
Status: Open
---
TICKET #10487 | 2024-11-30 03:55:00 UTC | Priority: MEDIUM | Region: East
Customer: Meera Nair
Issue: I was getting errors trying to place my order for ₹8,200 earlier tonight. I tried again just now and it finally went through, and I received the confirmation email. I just wanted to make sure my duplicate attempts didn't charge me twice.
Agent Notes: Confirmed only one transaction succeeded; checkout service has recovered and is now stable.
Status: Resolved
---
"""
    with open(tickets_path, "w", encoding="utf-8") as f:
        f.write(support_tickets_content)
        
    # =========================================================================
    # ZIP CREATION
    # =========================================================================
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(metrics_path, arcname="metrics.csv")
        zipf.write(deploy_log_path, arcname="deployment_log.txt")
        zipf.write(db_log_path, arcname="db_error_logs.txt")
        zipf.write(tickets_path, arcname="support_tickets.txt")
        
    # =========================================================================
    # PRINT SUMMARY
    # =========================================================================
    def count_lines(path):
        with open(path, "r", encoding="utf-8") as f:
            return len(f.readlines())
            
    print("=======================================================================")
    print("MESHLOOP ARCA — INCIDENT DATA GENERATION SUMMARY")
    print("=======================================================================")
    
    # metrics.csv
    size_metrics = os.path.getsize(metrics_path)
    print(f"File: metrics.csv")
    print(f"  Path: {metrics_path}")
    print(f"  Size: {size_metrics / 1024:.2f} KB ({size_metrics} bytes)")
    print(f"  Rows: {len(df)} (including header and duplicates)")
    print(f"  Date Range: 2024-11-29 00:00 UTC to 2024-12-01 00:00 UTC")
    print()
    
    # deployment_log.txt
    size_deploy = os.path.getsize(deploy_log_path)
    print(f"File: deployment_log.txt")
    print(f"  Path: {deploy_log_path}")
    print(f"  Size: {size_deploy / 1024:.2f} KB ({size_deploy} bytes)")
    print(f"  Lines: {count_lines(deploy_log_path)}")
    print(f"  Date Range: 2024-11-29 07:45:00 UTC to 2024-11-29 23:30:00 UTC")
    print()
    
    # db_error_logs.txt
    size_db = os.path.getsize(db_log_path)
    print(f"File: db_error_logs.txt")
    print(f"  Path: {db_log_path}")
    print(f"  Size: {size_db / 1024:.2f} KB ({size_db} bytes)")
    print(f"  Lines: {count_lines(db_log_path)}")
    print(f"  Date Range: 2024-11-30 01:50:22 UTC to 2024-11-30 04:00:00 UTC")
    print()
    
    # support_tickets.txt
    size_tickets = os.path.getsize(tickets_path)
    print(f"File: support_tickets.txt")
    print(f"  Path: {tickets_path}")
    print(f"  Size: {size_tickets / 1024:.2f} KB ({size_tickets} bytes)")
    print(f"  Lines: {count_lines(tickets_path)}")
    print(f"  Tickets: 6")
    print(f"  Date Range: 2024-11-30 02:17:34 UTC to 2024-11-30 03:55:00 UTC")
    print("=======================================================================")
    print(f"[SUCCESS] Created ZIP archive: {zip_path}")
    print("=======================================================================")
    
    # =========================================================================
    # CLEANUP LOOSE FILES
    # =========================================================================
    for path in [metrics_path, deploy_log_path, db_log_path, tickets_path]:
        if os.path.exists(path):
            os.remove(path)
            
if __name__ == "__main__":
    main()
