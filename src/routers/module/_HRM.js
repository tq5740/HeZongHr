const Index = resolve => require(['@pages/index'], resolve)
export default [
    {
        path: "/",
        redirect: "/HRM/personnel/manList",
        component: Index,
        children: [
            {
                path: "/HRM/payroll/list",
                component: resolve => require(['@pages/HRM/payroll/list'], resolve)
            },
            {
                path: "/HRM/payroll/salaryGroups",
                component: resolve => require(['@pages/HRM/payroll/salaryGroups'], resolve)
            },
            {
                path: "/HRM/personnel/manList",
                component: resolve => require(['@pages/HRM/personnel/manList'], resolve)
            },
            {
                path: "/HRM/personnel/deptList",
                component: resolve => require(['@pages/HRM/personnel/deptList'], resolve)
            },
            {
                path: "/HRM/template/list",
                component: resolve => require(['@pages/HRM/template/list'], resolve)
            },
            {
                path: "/HRM/performance/dept",
                component: resolve => require(['@pages/HRM/dialog/deptPerformanceList'], resolve)
            },
            {
                path: "/HRM/performance/staff",
                component: resolve => require(['@pages/HRM/dialog/staffDetail'], resolve)
            },
        ]
    }
];