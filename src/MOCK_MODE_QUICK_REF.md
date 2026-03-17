# Mock Mode - Quick Reference Card

## 🚀 Getting Started (5 seconds)

1. **Load the app** - Automatically logged in as DevOps Admin in mock mode
2. **Explore freely** - All features work, changes persist in memory
3. **Switch roles** - Logout and use quick login buttons if needed

## 👥 Auto-Login & Quick Login

**Default:** App starts with **DevOps Admin** logged in automatically

**Quick Login Users (on login page):**

| Button | Username | Role | Access |
|--------|----------|------|--------|
| **DevOps Admin** | devops_admin | DevOps | Everything |
| **Delivery Lead** | delivery_lead | Delivery | Dashboard, CRF, Clients, Reports |
| **Acme Client** | client_acme | Client | Versions & Own History |

## 📊 Mock Data at a Glance

- **8 Users** across 3 roles
- **8 Clients** (3 with customizations)
- **5 Versions** (3.0.8 to 3.2.1)
- **6 CRFs** (various states)
- **5 Workflow Steps**
- **7 API Configs**
- **4 Error Notifications**
- **Complete Reports & Dashboards**

## 🎯 Quick Actions

### Create a CRF
1. CRF Workflow → New CRF
2. Pick version + clients
3. Submit

### Approve CRF
1. Find pending CRF
2. View details
3. Click Approve

### Update Client
1. Clients → Select client
2. Update Version
3. Choose new version

### View Reports
1. Reporting → Select type
2. Set date range
3. View data

## ⚡ Key Features

✅ **No Backend Needed** - Runs 100% in browser
✅ **One-Click Login** - Quick login buttons
✅ **Full CRUD** - Create, Read, Update, Delete
✅ **Business Logic** - Customization checks, workflows
✅ **Audit Trail** - All changes logged
✅ **Role-Based** - Different views per role

## 🎨 Visual Indicators

- **Blue "Mock Mode" badge** - Top right corner
- **Blue banner** - Top of page (dismissible)
- **Toggle switch** - Login page
- **Mock API/Mock Data** - In system status

## 🔄 Toggle Modes

**To Real API:**
1. Login page → Toggle off
2. App reloads
3. Need backend + credentials

**Back to Mock:**
1. Login page → Toggle on
2. App reloads
3. Quick login available

## ⚠️ Important Notes

- **Temporary Data** - Resets on browser close
- **No Emails** - Notifications are mocked
- **No Real APIs** - External calls simulated
- **Manual Deployments** - Auto-deploy won't trigger

## 🧪 Testing Scenarios

### Test Customization Block
1. Login as DevOps Admin
2. Try updating "Acme Corporation" (has customizations)
3. Note: Auto-update blocked, manual deploy required

### Test Workflow
1. Create CRF as DevOps Admin
2. Approve at each step
3. Watch status change: Pending → Approved → Completed

### Test Role Switching
1. Login as DevOps Admin (see all menus)
2. Logout
3. Login as Delivery Lead (limited menus)
4. Logout
5. Login as Acme Client (minimal menus)

## 🔍 Where to Find Things

| Feature | Path |
|---------|------|
| Dashboard | / |
| CRF Workflow | /crf/workflow |
| Clients | /clients |
| Versions | /versions |
| Reports | /reporting |
| API Config | /api-config |
| Audit Log | /audit-log |
| Deployment Queue | /deployment-queue |

## 📖 Documentation

- **Full Guide**: See `/MOCK_MODE_GUIDE.md`
- **README**: See `/MOCK_MODE_README.md`
- **Summary**: See `/MOCK_MODE_SUMMARY.md`

## 💡 Tips

1. **Use quick login** for instant access to different roles
2. **Check audit log** to see all your changes
3. **Dismiss banner** if you prefer cleaner UI
4. **Refresh page** to keep data (doesn't reset)
5. **Close browser** to reset to original mock data

## 🐛 Troubleshooting

**Q: Where are quick login buttons?**
A: Only appear when mock mode is ON (toggle on login page)

**Q: Changes disappeared?**
A: Browser was closed. Data only persists during session.

**Q: Can't see all menu items?**
A: Check user role - Delivery and Client have limited access.

**Q: Toggle not working?**
A: Page must reload after toggle. Wait 1 second.

## ✨ Perfect For

- **Demos** - No infrastructure needed
- **Development** - Frontend work without backend
- **Testing** - Safe environment to explore
- **Training** - Learn the system risk-free
- **Presentations** - Works offline

---

**Default State:** Mock mode is ON by default
**Quick Access:** One-click login buttons
**Data Safety:** All changes are temporary
**Full Featured:** Complete functionality
**Zero Setup:** No backend required

🎉 **Start exploring in 30 seconds!**