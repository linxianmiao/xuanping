/* eslint-disable comma-dangle */
module.exports = {
  queryApproveCount: '/approve/queryApproveCount', // 获取审阅工单数量
  get_comparsion: '/config/trigger/getComparsion', // 根据code返回当前条件的value
  person_get_ticketList: '/ticket/getTicketList', // 个人待处理工单列表统计
  get_ticketList: '/ticket/getTicketList', // 获取工单列表
  getAllColumns: '/config/field/getAllColumns', // 获取所有字段（分类的）
  BATCH_DELETE: '/ticket/batchDeleteTickets', // 批量删除工单
  get_depart_list_tree: '/config/depart/list_tree', // 请求部门树
  get_processList: '/ticket/getProcessList', // 获取模型列表
  getUseableModels: '/config/model/getUseableModels', // 获取模型列表带分页（查询用）

  getPersonalQueryView: '/ticket/view/getPersonalQueryView', // 查询视图详情
  saveView: '/ticket/view/saveView', // 保存视图接口
  deletePersonalQueryView: '/ticket/view/deletePersonalQueryView', // 删除查询视图
  updatePersonalViewName: '/ticket/view/updatePersonalViewName', // 更新视图名称
  getAllViewList: '/ticket/view/getAllViewList', // 获取视图列表

  getUsersWithoutCarryOrg: '/config/userGroup/getUsersWithoutCarryOrg', // 根据id获取人员详细信息
  queryFieldInfosByCodes: '/config/field/queryFieldInfosByCodes', // 根据字段code获取字段的简略信息
  person_get_all_ticket: '/ticket/getAllTicket', // 获取工单列表
  tickList_count: '/ticket/getAllTicket/count', // 工单列表总数
  getTicketFormData: '/ticket/getTicketFormData', // 获取所有工单的定制列信息

  queryActivityStaffList: '/user/query/queryActivityStaffList', // 流程中人员选择
  queryStaffSelectionInfos: '/user/query/queryStaffSelectionInfos', // 人员选择组件

  USER_LIST_NO_ORG: '/config/userGroup/getUsersWithoutCarryOrg', // 获取用户列表

  queryDepartsByIds: '/config/depart/queryDepartsByIds',
  getGroupListByIds: '/config/userGroup/getGroupListByIds', // 根据用户组id获取用户组信息
  queryMatrixSelectionInfos: '/user/query/queryMatrixSelectionInfos', // 点击选择某个矩阵具体的某一列
  GET_USER_BY_ID: (id) => `/config/userGroup/getUserById/${id}`, // 根据用户获取用户详情
  getModelAndTache: '/ticket/getModelAndTache', // 获取模型数据筛选条件
  queryFieldDetailsByCodes: '/config/field/queryFieldDetailsByCodes', //  根据code获取字段详情
  queryFieldUrgentLevel: '/config/field/queryFieldUrgentLevel' // 获取优先级配置
}
