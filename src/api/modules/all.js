import http from "../base";
export default {
    postAPI(data) { return http.post(`${http.router}`, data) },
    getAPI(data) { return http.get(`${http.router}`, data) },
    http() { return http },
    
    // 人员管理
    manList() { return "hr.employee.querypage" },
    manImport() { return "hr.employee.import" },
    manExport() { return "hr.employee.export" },
    manSave() { return "hr.employee.save" },
    manUpdate() { return "hr.employee.update" },
    manDelete() { return "hr.employee.delete" },
    manResign() { return "hr.employee.resign" },
    manQuery() { return "hr.employee.select" },
    deptTreeData() { return "hr.dept.queryTree" }, // 部门树

    deptLeaderCode() { return "hr.dept.LeaderForSave" },  // 部门负责人码表
    deptQuery() { return "hr.dept.select" },
    deptSave() { return "hr.dept.save" },
    deptDelete() { return "hr.dept.delete" },
    
    templateCode() { return "hr.performance.template.code" },
    templateTestCode() { return "hr.performance.template.testStaffCode" },
    templateList() { return "hr.performance.template.querypage" },
    templateSave() { return "hr.performance.template.save" },
    templateUpdate() { return "hr.performance.template.update" },
    templateDelete() { return "hr.performance.template.delete" },
    templateDetail() { return "hr.performance.template.detail" },
    templateGroupSave() { return "hr.performance.template.group.save" },
    templateGroupUpdate() { return "hr.performance.template.group.update" },
    templateGroupDelete() { return "hr.performance.template.group.delete" },
    templateItemSave() { return "hr.performance.template.item.save" },
    templateItemUpdate() { return "hr.performance.template.item.update" },
    templateItemDelete() { return "hr.performance.template.item.delete" },
    templateAllByGroup() { return "hr.performance.template.allByGroup" },

    salarygroupList() { return "hr.performance.calc.summary" },
    salarygroupSave() { return "hr.performance.salarygroup.save" },
    salarygroupQuery() { return "hr.performance.salarygroup.query" },
    salarygroupDelete() { return "hr.performance.salarygroup.delete" },
    salarygroupCycleUpdate() { return "hr.performance.salarygroup.cycle.update" },

    salarygroupStaffAdd() { return "hr.performance.salarygroup.staff.add" },
    salarygroupDeleteemployee() { return "hr.performance.salarygroup.deleteemployee" },
    salarygroupTemplateUpdate() { return "hr.performance.salarygroup.template.update" },
    salarygroupTree() { return "hr.performance.salarygroup.tree" },
    dataQuerypage() { return "hr.performance.data.querypage" },
    calcExec() { return "hr.performance.calc.exec" },
    calcLock() { return "hr.performance.calc.lock" },
    calcImport() { return "hr.performance.calc.import" },
    dataExport() { return "hr.performance.data.export" },
    dataDelete() { return "hr.performance.data.delete" },
    dataUpdate() { return "hr.performance.data.update" },
    empdataChart() { return "hr.performance.empdata.chart" },
    empdataQuerypage() { return "hr.performance.empdata.querypage" },
    empdataStaffTree() { return "hr.performance.empdata.staffTree" }, // 员工树
};