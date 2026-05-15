"""
scripts/create_databases.py
Run this script ONCE to create the ticket_db and asset_db databases.

Usage:
    python scripts/create_databases.py

You will be prompted for your PostgreSQL password.
Or set the PGPASSWORD env var before running.
"""

import psycopg2
import getpass
import sys
import os

def create_databases():
    host = input("PostgreSQL host [localhost]: ").strip() or "localhost"
    port = input("PostgreSQL port [5432]: ").strip() or "5432"
    user = input("PostgreSQL user [postgres]: ").strip() or "postgres"
    password = getpass.getpass("PostgreSQL password: ")

    databases = ["ticket_db", "asset_db"]

    try:
        conn = psycopg2.connect(
            host=host, port=int(port),
            user=user, password=password,
            dbname="postgres"
        )
        conn.autocommit = True
        cur = conn.cursor()

        for db_name in databases:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            if cur.fetchone():
                print(f"  ✓ Database '{db_name}' already exists")
            else:
                cur.execute(f'CREATE DATABASE "{db_name}"')
                print(f"  ✓ Created database '{db_name}'")

        print("\n✅ Databases created successfully!")

        # Now run migrations and seeders for both services
        run_flask_commands("ticket-service", "ticket_db")
        run_flask_commands("asset-service", "asset_db")

        print("\n✅ Phase 2 Database Setup Complete! Update your .env files with:")
        print(f"   DATABASE_HOST={host}")
        print(f"   DATABASE_PORT={port}")
        print(f"   DATABASE_USER={user}")
        print(f"   DATABASE_PASSWORD=<your password>")

    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

def run_flask_commands(service_name, db_name):
    import subprocess
    print(f"\n--- Setting up schemas for {service_name} ({db_name}) ---")
    
    # Run flask db upgrade to create schemas
    env = os.environ.copy()
    env["FLASK_APP"] = "run.py"
    
    # Make sure migrations directory exists. If not, init and migrate.
    migrations_dir = os.path.join(service_name, "migrations")
    try:
        if not os.path.exists(migrations_dir):
            print(f"Initializing Alembic migrations in {service_name}...")
            subprocess.run(["flask", "db", "init"], cwd=service_name, env=env, check=True)
            print(f"Creating initial migration in {service_name}...")
            subprocess.run(["flask", "db", "migrate", "-m", "Initial schema"], cwd=service_name, env=env, check=True)
        
        print(f"Applying migrations to {db_name}...")
        subprocess.run(["flask", "db", "upgrade"], cwd=service_name, env=env, check=True)
        
        # Run seeder
        seeder_name = "seed_tickets" if service_name == "ticket-service" else "seed_assets"
        print(f"Seeding {db_name}...")
        subprocess.run([sys.executable, "-m", f"scripts.{seeder_name}"], cwd=service_name, env=env, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Migration or seeding failed for {service_name}: {e}")

if __name__ == "__main__":
    create_databases()
