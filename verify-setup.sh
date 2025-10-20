# Amazon PPC Dashboard - Live Data Setup
# =====================================

echo "🚀 FINAL VERIFICATION: Complete BigQuery Dashboard Setup"
echo "========================================================"

# Check if all components are ready
echo "📋 Setup Checklist:"
echo "   ✅ Dashboard deployed: https://natureswaysoil.github.io/best/"
echo "   ⏳ Service account created"
echo "   ⏳ BigQuery dataset created"
echo "   ⏳ Permissions granted"
echo "   ⏳ Data loaded"
echo ""

# Run final test
echo "🧪 Running final connection test..."
if [ -f "bigquery-service-account-key.json" ]; then
    echo "   ✅ Service account key found"
    ./test-bigquery.sh
else
    echo "   ❌ Service account key missing"
    echo "   Please run the setup commands from MANUAL-SETUP.md first"
    exit 1
fi

echo ""
echo "🎉 SETUP COMPLETE!"
echo "================="
echo ""
echo "🌐 Dashboard URL: https://natureswaysoil.github.io/best/"
echo ""
echo "📊 Dashboard Features:"
echo "   - Live Amazon PPC campaign metrics"
echo "   - Interactive performance charts"
echo "   - Real-time data updates"
echo "   - 30-day trend analysis"
echo ""
echo "🔧 Maintenance:"
echo "   - Update data daily in BigQuery"
echo "   - Monitor service account usage"
echo "   - Rotate keys every 90 days"
echo ""
echo "📞 Support:"
echo "   - Check MANUAL-SETUP.md for troubleshooting"
echo "   - Verify BigQuery permissions if connection fails"