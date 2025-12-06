# Custom CSS to Tailwind Conversion Reference

## Conversion Status

### ✅ Completed Files
1. `Pages/Shared/_Layout.cshtml` - Base layout (completely rewritten)
2. `Pages/Shared/_AppLayout.cshtml` - Dashboard layout 
3. `Pages/Dashboard.cshtml` - Dashboard homepage
4. `Pages/Sessions/Index.cshtml` - Sessions list (11 replacements)
5. `Pages/Sessions/TestDrive/Create.cshtml` - Partial (1 replacement, needs completion)

### ⚠️ Partially Complete
- `Pages/Sessions/Details.cshtml` - 19 badge instances
- `Pages/Sessions/Inspection/Create.cshtml`
- `Pages/Sessions/Inspection/Details.cshtml`
- `Pages/Sessions/TestDrive/Details.cshtml`
- `Pages/Sessions/JobCard/Create.cshtml`
- `Pages/Sessions/JobCard/Details.cshtml`
- `Pages/Sessions/CustomerRequest/Create.cshtml`
- `Pages/Sessions/CustomerRequest/Details.cshtml`
- `Pages/Sessions/Reports/Initial.cshtml`

### ❌ Not Started
- `Pages/Clients/Index.cshtml` - 80+ instances
- `Pages/Clients/Details.cshtml` - 80+ instances
- `Pages/Vehicles/Index.cshtml` - 14 instances
- `Pages/Appointments/Details.cshtml`
- `Pages/Shared/_ClientSearch.cshtml`
- Pages in: Invoices, Inventory, Settings, Admin folders

## Conversion Mapping

### Card Classes
```
card-apple → bg-white rounded-2xl shadow-sm border border-slate-200
```

### Button Classes
```
btn-apple-primary → inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors

btn-apple-secondary → inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors

btn-apple-ghost → inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 transition-colors
```

### Input Classes
```
input-apple → w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors

input-apple-outlined → w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors
```

### Badge Classes
```
badge-apple-blue → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700

badge-apple-indigo → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700

badge-apple-teal → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700

badge-apple-green → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700

badge-apple-orange → inline-flex items-centers gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700

badge-apple-purple → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700

badge-apple-red → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700

badge-apple-gray → inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700
```

### Color Classes (Text)
```
text-apple-dark → text-slate-900
text-apple-gray → text-slate-600
text-apple-blue → text-sky-600
text-apple-teal → text-cyan-600
text-apple-green → text-green-600
text-apple-orange → text-orange-600
text-apple-purple → text-purple-600
text-apple-red → text-red-600
text-apple-indigo → text-indigo-600
```

### Color Classes (Background)
```
bg-apple-blue → bg-sky-600
bg-apple-teal → bg-cyan-600
bg-apple-green → bg-green-600
bg-apple-orange → bg-orange-600
bg-apple-purple → bg-purple-600
bg-apple-red → bg-red-600
bg-apple-indigo → bg-indigo-600
```

### Gradient Classes
```
bg-gradient-to-r from-apple-blue to-apple-purple → bg-gradient-to-r from-sky-600 to-purple-600

bg-gradient-to-r from-apple-teal to-apple-green → bg-gradient-to-r from-cyan-600 to-green-600

bg-gradient-to-r from-apple-green to-apple-blue → bg-gradient-to-r from-green-600 to-sky-600
```

### Hover/State Classes
```
hover:bg-apple-blue/10 → hover:bg-sky-100
hover:bg-apple-green/90 → hover:bg-green-700
bg-apple-green/10 → bg-green-100
bg-apple-green/15 → bg-green-100
text-apple-blue hover:bg-apple-blue/10 → text-sky-600 hover:bg-sky-100
```

## Search & Replace Commands

### PowerShell Search for Remaining Custom Classes
```powershell
# Find all files with custom CSS classes
Select-String -Path "Pages/**/*.cshtml" -Pattern "card-apple|btn-apple|badge-apple|apple-blue|apple-gray|apple-green|apple-red|apple-orange|apple-purple|apple-teal|apple-indigo|apple-dark" -AllMatches | Select-Object Path, LineNumber, Line | Format-Table -Auto
```

### Grep Search Patterns (use in VS Code)
```
Pattern: card-apple|btn-apple|badge-apple
Pattern: apple-blue|apple-gray|apple-green|apple-red|apple-orange|apple-purple|apple-teal|apple-indigo|apple-dark
Pattern: from-apple|to-apple|hover.*apple
```

## Files Statistics

### Total Custom CSS Instances Found
- **200+ matches** across all Pages/**/*.cshtml files
- Primary files affected:
  - Sessions folder: ~100 instances
  - Clients folder: ~80 instances  
  - Vehicles folder: ~14 instances
  - Appointments folder: ~20 instances (estimated)
  - Shared components: ~5 instances

## Batch Conversion Strategy

### Recommended Approach
1. **Convert by directory** (Sessions → Clients → Vehicles → etc.)
2. **Use multi_replace_string_in_file** for efficiency (batch 5-10 replacements per file)
3. **Test after each directory** to ensure no breakage
4. **Run grep search** after completing each directory

### Priority Order
1. ✅ Core layouts (_Layout, _AppLayout, Dashboard) - DONE
2. 🔄 Sessions pages (12 files) - IN PROGRESS
3. ❌ Clients pages (2 files, high instance count)
4. ❌ Vehicles pages (1 file)
5. ❌ Appointments pages
6. ❌ Shared components
7. ❌ Other pages (Invoices, Inventory, Settings, Admin)

## Notes

- **NO Bootstrap Icons**: All icons replaced with SVG or kept as `<i class="bi bi-*">` (Bootstrap Icons CSS still loaded)
- **Color scheme**: Slate (gray), Sky (blue), Green, Orange, Purple, Red, Cyan (teal)
- **NO @apply directives**: Pure Tailwind utility classes only
- **Card pattern**: Always include `p-4`, `p-5`, `p-6`, or `p-8` padding explicitly
- **Button pattern**: Always include `inline-flex items-center justify-center gap-2`
- **Badge pattern**: Always include `inline-flex items-center gap-1.5`

## Verification

After completing all conversions, run:
```powershell
# Should return 0 results
Select-String -Path "Pages/**/*.cshtml" -Pattern "card-apple|btn-apple-|badge-apple-|apple-blue|apple-gray|apple-green|apple-red|apple-orange|apple-purple|apple-teal|apple-indigo|apple-dark" | Measure-Object
```

## Example Conversion (Sessions/Index.cshtml)

Before:
```cshtml
<a href="/Sessions/Create" class="btn-apple-primary">
    <i class="bi bi-plus-lg"></i>
    New Check-In
</a>
```

After:
```cshtml
<a href="/Sessions/Create" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors">
    <i class="bi bi-plus-lg"></i>
    New Check-In
</a>
```

Before:
```cshtml
var badgeClass = session.Status switch
{
    SessionStatus.Completed => "badge-apple-green",
    SessionStatus.InProgress => "badge-apple-blue",
    _ => "badge-apple-gray"
};
```

After:
```cshtml
var badgeClass = session.Status switch
{
    SessionStatus.Completed => "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700",
    SessionStatus.InProgress => "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700",
    _ => "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"
};
```
