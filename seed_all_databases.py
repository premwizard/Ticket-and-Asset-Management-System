#!/usr/bin/env python3
"""
Master Database Seeder Script
Seeds both Asset and Ticket databases with dummy data
"""

import sys
import os
import subprocess

# Get the root directory
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def run_seed(service_name, script_path):
    """Run a seed script for a specific service"""
    print(f"\n{'='*60}")
    print(f"🌱 Seeding {service_name}...")
    print(f"{'='*60}")
    
    try:
        # Change to service directory
        service_dir = os.path.join(ROOT_DIR, service_name)
        
        if not os.path.exists(service_dir):
            print(f"❌ Service directory not found: {service_dir}")
            return False
        
        # Run the seed script
        result = subprocess.run(
            [sys.executable, "-m", script_path.replace("/", ".")],
            cwd=service_dir,
            capture_output=True,
            text=True
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode != 0:
            print(f"❌ Failed to seed {service_name}")
            return False
        
        print(f"✅ Successfully seeded {service_name}")
        return True
        
    except Exception as e:
        print(f"❌ Error seeding {service_name}: {str(e)}")
        return False

def main():
    """Main function to seed all databases"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + "  Database Seeder - Asset & Ticket Management System  ".center(58) + "║")
    print("╚" + "="*58 + "╝")
    
    # Seed Asset Service
    asset_success = run_seed("asset-service", "scripts/seed_assets")
    
    # Seed Ticket Service
    ticket_success = run_seed("ticket-service", "scripts/seed_tickets")
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 SEEDING SUMMARY")
    print(f"{'='*60}")
    print(f"Asset Service:  {'✅ Success' if asset_success else '❌ Failed'}")
    print(f"Ticket Service: {'✅ Success' if ticket_success else '❌ Failed'}")
    print(f"{'='*60}")
    
    if asset_success and ticket_success:
        print("\n✨ All databases seeded successfully!")
        print("\n📝 Dummy Data Inserted:")
        print("  • Assets: 4 assets (laptops, monitors, servers)")
        print("  • Tickets: 4 tickets (various priorities and statuses)")
        print("\n🚀 You can now start the services and test with Postman!")
        return 0
    else:
        print("\n⚠️  Some databases failed to seed. Check errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
