type AuthListItem = {
    code: string // "bc29da1a-da1d-46a1-8e94-97ea1a0285e6-insert"
    deviceType: number // 1
    hasAuth: boolean // false
    id: number // 21
    name: string // "人员管理-新增人员"
    pid: number // 20
    privilegeType: number // 3
    sysId: number // 3
}

type AuthResult = {
    pass: boolean // 是否校验通过，能看到
    hasAuth: boolean // 是否有操作权限，能操作
    result: AuthListItem // 权限校验结果信息
}