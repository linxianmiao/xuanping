const path = '/itsm/api/v2'

const API = {
  person_overdue: `${path}/ticket/overview/person_overdue`, // 个人总览预期订单数统计
  person_priority: `${path}/ticket/overview/person_priority`, // 个人待处理工单图表统计
  person_get_ticketList: `${path}/ticket/getTicketList`, // 个人待处理工单列表统计
  person_status: `${path}/ticket/overview/person_status`, // 个人创建工单图表统计
  person_get_all_ticket: `${path}/ticket/getAllTicket`, // 个人创建工单图表统计
  tickList_count: `${path}/ticket/getAllTicket/count`, // 工单列表总数

  default_get_count: `${path}/ticket/overview/count`, // 租户工单数量统计
  default_get_trend: `${path}/ticket/overview/trend`, // 租户工单趋势图
  default_priority_distribution: `${path}/ticket/overview/priority_distribution`, // 租户待处理优先级图表
  default_get_module: `${path}/ticket/getModelByUser`, // 获取用户工单模型
  default_statistics: `${path}/ticket/overview/statistics`, // 工单统计柱状图
  default_distribution: `${path}/ticket/overview/distribution`, // 租户工单类型分布图表
  default_user_ticket: `${path}/ticket/overview/user_ticket`, // 租户处理人工单统计

  get_user_group: `${path}/config/userGroup/getGroupList`, // 获取用户分组列表
  update_user_group: `${path}/config/userGroup/updateGroup`, // 更新用户分组信息
  add_group_name: `${path}/config/userGroup/addGroup`, // 创建用户分组
  del_group_name: `${path}/config/userGroup/delGroup`, // 删除用户分组
  get_group_name: `${path}/config/userGroup/getGroupByName`, // 获取分组用户名称
  get_users_by_group_id: `${path}/config/userGroup/getUsersByGroupId`, // 根据分组id获取用户列表
  get_free_user: `${path}/config/userGroup/getFreeUsers`, // 获取空闲用户
  add_user_to_group: `${path}/config/userGroup/addUserToGroup`, // 添加用户进用户组
  remove_user_from_group: `${path}/config/userGroup/removeUser`, // 从用户组移除用户
  multi_remove_user_from_group: `${path}/config/userGroup/removeMultiUser`, // 从用户组批量移除用户

  get_suffix: `${path}/srv_port/suffix/get`, // 返回用户门户url前缀
  save_suffix: `${path}/srv_port/suffix/save`, // 更新用户门户url前缀

  get_extend_field_list: `${path}/config/field/queryFieldsWithLayout`, // 获取扩展字段列表
  get_builtin_field_list: `${path}/config/field/getFieldList`, // 获取内置字段列表
  query_field_layouts: `${path}/config/field/queryLayouts`, // 获取扩展字段分组列表
  query_field_layouts_by_pagination: `${path}/config/field/pageQueryLayouts`, // 分页获取扩展字段分组列表
  save_field_layouts: `${path}/config/field/saveLayout`, // 新建字段分组
  update_field_layouts: `${path}/config/field/updateLayout`, // 更新字段分组
  delete_field_layouts: `${path}/config/field/deleteLayout`, // 根据id删除字段分组
  move_field_layouts: `${path}/config/field/moveFieldToLayout`, // 移动字段至指定的分组
  candel_field: `${path}/config/field/candelfield`, // 确定字段是否关联模型，可否删除
  save_field: `${path}/config/field/saveField`, // 保存字段
  get_field: `${path}/config/field/findFieldByCode`, // 获取字段信息
  get_all_field: `${path}/config/field/getFieldList`, // 获取所有字段信息
  list_field_With_page: `${path}/config/field/listFieldWithPage`, // 获取所有字段信息
  update_field: `${path}/config/field/updateField`, // 更新字段
  delete_field: `${path}/config/field/delField`, // 删除字段
  get_customer: `${path}/customers/query`, // 获取客户人员
  query_field_with_type: `${path}/config/field/queryFieldWithType`, // 获取表格字段类型对应的默认值
  upload_excel_field: `${path}/excelservice/getExcelColumn`, // 上传 Excel 模板获取表头
  download_excel_column: `${path}/config/field/downloadExcel`, // 下载 Excel 模板
  upload_excel_data: `${path}/config/field/getExcelData`, // 上传 Excel 获取数据

  get_key_by_request: `${path}/config/field/getKeyByRestRequest`, // 获取外部数据来源key
  get_value_by_request: `${path}/config/field/getValueByRestRequest`, // 获取外部数据来源value

  create_customer: `${path}/customers/create`, // 创建客户人员
  delete_customer: `${path}/customers/delete`, // 删除客户人员
  detail_customer: `${path}/customers/get`, // 查询客户人员
  update_customer: `${path}/customers/update`, // 更新客户人员
  update_customer_status: `${path}/customers/status`, // 变更启用状态
  customer_import: `${path}/customers/importCustomers`, // 变更启用状态
  template_download: `${path}/customers/exportTemplate`, // 变更启用状态

  query_system: `${path}/config/system/query`, // 查询全局配置
  update_system: `${path}/config/system/setState`, // 设置全局配置

  query_users_without_org: `${path}/config/userGroup/queryUsersWithoutOrg`, // 获取用户信息，无组织机构
  get_processList: `${path}/ticket/getProcessList`, // 获取模型列表
  get_ticketList: `${path}/ticket/getTicketList`, // 获取工单列表
  receiveTicket: (id) => `${path}/ticket/receiveTicket/${id}`, // 接单
  attentionTicket: (ticketId, status, modelId) =>
    `${path}/ticket/attention/${ticketId}/${status}/${modelId}`, // 关注
  reminderTicket: `${path}/ticket/reminder`, // 催办
  suspendAndResume: `${path}/ticket/suspendAndResume`, // 挂起和恢复

  intoCreateTicket: (id) => `${path}/ticket/intoCreateTicket/${id}`, // 根据模型id获取创建工单的列表
  UPLOAD: `${path}/file/upload`, // 上传文件
  deleteFile: `${path}/file/deleteFile`, // 删除上传的文件
  field_list: `${path}/config/field/getFieldList`, // 获取所有字段列表

  getConditionTypesWithoutModel: `${path}/config/trigger/getConditionTypesWithoutModel`, // 获取SLA策略嵌套条件字段
  getConditionTypes: `${path}/config/trigger/getConditionTypes`, // 获取触发器嵌套字段列表
  get_auto_list: `${path}/config/model/getAutoList`, // 返回自动节点的关联编排列表
  get_auto_params: `${path}/config/model/getAutoParams`, // 返回当前关联编排的参数
  copy_sub_flow: `${path}/config/model/cloneModelProcessChart`, // 复制子流程
  verify_sub_flow: `${path}/config/model/verifyCloneModelProcessChart`, // 验证是否能复制子流程
  get_comparsion: `${path}/config/trigger/getComparsion`, // 根据code返回当前条件的value
  get_nodes_by_model: `${path}/config/trigger/getNodesBymodel`, // 根据mode返回当前条件

  DOWNLOAD: `${path}/file/downloadFile`, // 附件下载
  CHECKUSERPERMISSION: `${path}/res/checkUserPermission`, // 获取配置项数据,
  GETCMDBRESOURCES: (id) => `${path}/res/getCMDBResources/${id}`, // 根据id从cmdb获取配置项数据
  GETRESLIST: (id) => `${path}/res/getResList?ticketId=${id}`, // 配置项用
  getCIResourceList: `${path}/res/getCIResourceList`, // 用于配置项字段，资产存入沙箱提交后，获取数据
  PLAN_TO_DELETE_CI: `${path}/res/addResourceDeleteTask`, // 配置项用
  REMOVESANDBOXTASK: `${path}/res/removeRelateResource`, // 配置项用
  querySandbox: `${path}/res/querySandbox`, // 查询沙箱中的taskid
  getSandboxId: `${path}/res/getSandboxId`, // 获取沙箱id
  CREATESANDBOX: `${path}/res/createCMDBSanbox`, // 配置项用
  ISEDITRESOURCE: `${path}/res/isEditResource`, // 配置项用
  COMPARERESOURCE: `${path}/res/compareContent`, // 配置项用
  resourceSaveTask: `${path}/res/saveCITask`, // 配置项用
  TICKETDETAIL: (id) => `${path}/ticket/getTicketDetal/${id}`, // 根据工单id获取工单详情
  GET_ACTIVITY_BY_ID: `${path}/ticket/getActivityById`, // 流程按钮相关
  CONFLICT: `${path}/ticket/checkConflict`, // 冲突检测
  RECEIVTICKET: (id, tacheNo, tacheType) => `${path}/ticket/receiveTicket/${id}`, // 接单
  user_in_task: `${path}/ticket/userInTask`, // 会签改派时校验用户是否有处理中的任务
  get_depart_user_list: `${path}/config/depart/list_users_and_subs`, // 请求组织机构
  query_group_list: `${path}/config/userGroup/queryGroupList`, // 请求用户组
  query_user_with_ticket_num: `${path}/config/userGroup/queryUsersWithTicketNum`, // 请求人员
  query_depart_and_users: `${path}/config/depart/query_depart_and_users`, // 请求部门和人员
  query_group_and_users: `${path}/config/userGroup/queryGroupAndUsers`, // 请求用户组和人员
  query_users_by_group_id: `${path}/config/userGroup/queryUsersByGroupId`, // 用户组下 请求人
  REVOKETICKET: (id) => `${path}/ticket/revokeTicket/${id}`, // 撤回工单
  USER_LIST_NO_ORG: `${path}/config/userGroup/getUsersWithoutCarryOrg`, // 获取用户列表
  CHECK_ORG: `${path}/config/system/checkOrg`, // 是否 开启 组织机构 的 接口
  get_autoParams: `${path}/config/model/getAutoParams`, // 获取当前编排的参数
  get_conditiontypes_withoutmodel: `${path}/config/trigger/getConditionTypesWithoutModel`, // 获取全部字段
  get_depart_list_tree: `${path}/config/depart/list_tree`, // 请求部门树
  GET_USER_BY_ID: (id) => `${path}/config/userGroup/getUserById/${id}`, // 根据用户获取用户详情
  get_model_list: `${path}/config/model/getModelList`, // model列表
  get_model_start_flow: (modelId, chartId) =>
    `${path}/config/model/getModelStartFlow?modelId=${modelId}&chartId=${chartId}`, // 子流程迁出路径
  get_model_process_chart: (modelId, chartId) =>
    `${path}/config/model/getModelProcessChart?modelId=${modelId}&chartId=${chartId}`, // 获取流程图数据
  getProcessChartList: `${path}/config/model/getProcessChartList`, // 获取流程列表
  createSubProcessChartInfo: (name, id) =>
    `${path}/config/model/createSubProcessChartInfo?name=${name}&modelId=${id}`, // 创建子流程
  changeProcessStatus: (modelId, chartId, status) =>
    `${path}/config/model/changeChartStatus?modelId=${modelId}&chartId=${chartId}&status=${status}`, // 修改流程状态
  editProcessName: (chartId, name) =>
    `${path}/config/model/updateChartName?chartId=${chartId}&name=${name}`, // 修改流程名称
  deleteProcess: (modelId, chartId) =>
    `${path}/config/model/deleteProcessChart?modelId=${modelId}&chartId=${chartId}`, // 删除流程

  COMMENT: (id) => `${path}/ticket/getCommentById/${id}`, // 根据工单id获取评论列表
  SUBCOMMENT: (id) => `${path}/ticket/queryByParentId/${id}`, // 获取子评论
  DELETECOMMENTBYID: (id) => `${path}/ticket/delComment/${id}`, // 删除评论
  POST_COMMENT: `${path}/ticket/comment`, // 提交评论内容

  query_models_with_layout: `${path}/config/model/queryModelsWithLayout`, // 获取有排序的模型列表
  change_status: `${path}/config/model/changeStatus`, // 启停模型
  sort_model_list: `${path}/config/model/sortModels`, // 模型排序 && 移动到功能

  GET_OPERATE_RECORD: (id) => `${path}/ticket/getProcessRecord/${id}`, // 根据工单id获取处理记录
  TICKET_LIST_REL: `${path}/ticket/getTicketListForRelate`, // 获取可以关联的工单列表
  GET_RELATE_TICKET: `${path}/ticket/getRelateTicket`, //  获取当前已经关联的工单列表
  RELATE_TICKET: `${path}/ticket/relateTicket`, // 关联工单
  queryMergeTickets: `${path}/ticket/relation/queryMergeTickets`, //  获取当前已经合并的工单列表
  DEL_RELATIONSHIP: `${path}/ticket/relieveRelateTicket`, // 删除当前关联的工单
  DEL_MERGESHIP: (srcId, destId, type) =>
    `${path}/ticket/relation/removeMergeTickets?srcId=${srcId}&destId=${destId}&type=${type}`, // 删除当前合并的工单
  save_model_layouts: `${path}/config/model/saveLayout`, // 模型新建分组
  update_model_layouts: `${path}/config/model/updateLayout`, // 模型更新分组
  sort_layouts: `${path}/config/model/sortLayouts`, // 模型分组排序
  delete_model_layout: `${path}/config/model/deleteLayout`, // 删除模型分组
  delete_model: `${path}/config/model/delModel`, // 删除模型
  check_del_model: `${path}/config/model/candelModel`, // 判断能否删除模型
  query_layouts: `${path}/config/model/queryLayouts`, // 获取分组列表
  query_model_layout: `${path}/dic/queryAuthLayouts`, // 查询模型类型
  move_model_to_layout: `${path}/config/model/moveModelToLayout`, // 模型移动到
  get_builtin_models: `${path}/config/model/getBuiltinModels`, // 获取内置模型
  get_field_params: `${path}/config/field/getFieldParamList`, // 触发器动作中，获取字段类型
  get_assign_users: `${path}/config/trigger/getAssignUsers`,
  get_noti_rule_actions: `${path}/config/trigger/getNotiRuleActions`, // 获取规则动作
  GETTICKETCACHE: (id) => `${path}/ticket/getTicketCache/${id}`, // 获取草稿
  GETSUBTICKETCACHE: (id) => `${path}/ticket/getSubTicketCache/${id}`, // 在子流程草稿中获取父流程数据
  TICKET_MOVE: `${path}/ticket/ticketMove`, // 工单提交
  TICKET_REAGGIGN: `${path}/ticket/ticketChange`, // 工单改派
  COMPLETETICKET: `${path}/ticket/completeTicket`, // 工单完成按钮
  CREATE_SUBMODEL: `${path}/ticket/createsubmodel`, // 发起子流程
  createSubProcess: `${path}/ticket/createSubProcess`, // 发起子流程手动建单
  ROLL_BACK: `${path}/ticket/rollBack`, // 工单回退
  DELETE_TICKET: `${path}/ticket/delTicket`, // 工单废除
  CLOSETICKET: `${path}/ticket/closeTicket`, // 工单关闭
  REOPEN: (id) => `${path}/ticket/reopenTicket/${id}`, // 工单重开
  RETRIEVE: `${path}/ticket/retrieve`, // 工单取回
  SAVETICKETCACHE: (id) => `${path}/ticket/saveTicketCache/${id}`, // 工单保存
  GET_FLOW_CHART: `${path}/ticket/getFlowChart`, // 获取流程图
  GET_TICKET_SLA: `${path}/ticket/getTicketSLA`, // 获取SLA详情
  GET_TICKET_SLA_LIST: `${path}/ticket/getTicketSLAList`, // 获取SLA列表
  TICKET_TRANSFORM_KB: `${path}/knowledge/transform`, // 对接KB
  RES_QUERYCOLUMNS: `${path}/res/queryColumns`, // 配置项定制
  POSTRESLIST: (id) => `${path}/res/relateRes/${id}`, // 提交配置项数据
  findFieldByCodeList: `${path}/config/field/findFieldByCodeList`, // 获取字段列表
  isGenerateKB: (id) => `${path}/knowledge/isGenerateKB?id=${id}`, // 检测kb是否可用
  GET_ISAPPROVE: `${path}/approve/checkApprove`, // 检测 是否 有 审阅 操作
  SAVE_APPROVE: `${path}/approve/saveApprove`, // 提交 已审阅
  ticket_update: `${path}/ticket/update/`, // 更新数据
  getTriggerActionList: `${path}/config/trigger/getTriggerActionList`, // 获取触发器动作列表
  delTriggerAction: `${path}/config/trigger/deleteAction`, // 删除触发器动作
  saveAction: `${path}/config/trigger/saveAction`, // 保存触发器动作
  changeActionStatus: `${path}/config/trigger/changeActionStatus`, // 更改触发器是否使用
  getActionById: `${path}/config/trigger/getActionById`, // 获取触发器动作详情
  GET_FIRST_ACTIVITY: (id) => `${path}/ticket/getFirstActivity?id=${id}`, // 模型规则及工单按钮API  created by fb
  getTargetNode: (id) => `${path}/ticket/getTargetNode?modelId=${id}`, // 根据模型ID获取开始环节的提交线(高级模型)
  getRealNodes: (id, flowId) => `${path}/ticket/getRealNodes/${id}/${flowId}`, // 创建页面提交时，获取  “由上一环节指定”和 “创建人指定” 的所有环节
  TACHE: (id) => `${path}/ticket/getTache/${id}`, // 获取所有环节，用于创建提交时 判断由创建人指定的执行人环节
  CREATETICKET: (id) => `${path}/ticket/createTicket/${id}`, // 创建工单
  CREATE_MOVE_TICKET: `${path}/ticket/createAndMove`, // 创建并跳转
  SAVE_ICON: `${path}/file/saveIcon`, // 模型那里的icon
  saveBaseModel: `${path}/config/model/saveBaseModel`, // 模型基本信息保存
  getBaseModel: (id) => `${path}/config/model/getBaseModel/${id}`, // 获取高级模型基本信息
  updateModelForm: `${path}/config/model/updateModelForm`, // 更新高级模型的表单管理
  saveModelForm: `${path}/config/model/saveModelForm`, // 保存高级模型的表单管理
  queryModelFields: `${path}/config/model/queryModelFields`, // 查询模型字段库列表
  saveModelFields: `${path}/config/model/saveModelFields`, // 保存模型字段库列表
  queryModelForms: (id) => `${path}/config/model/queryModelForms/${id}`, // 查看模型表单列表
  getModelForm: `${path}/config/model/getModelForm`, // 获取表单详细信息
  deleteModelForm: (id) => `${path}/config/model/deleteModelForm/${id}`, // 删除模型的表单
  saveModelProcessChart: `${path}/config/model/saveModelProcessChart`, // 更新高级模型的表单管理
  GET_MODEL_LAYOUT: `${path}/ticket/getModelInLayoutByUser`, // 获取模型列表
  queryStaffSelectionInfos: `${path}/user/query/queryStaffSelectionInfos`, // 人员选择组件
  queryStaffSelectionInfosNew: `${path}/user/query/queryStaffSelectionInfosNew`, // 人员选择组件
  queryMatrixSelectionInfos: `${path}/user/query/queryMatrixSelectionInfos`, // 点击选择某个矩阵具体的某一列
  saveParam: `${path}/config/variable/save`, // 创建变量
  uploadParam: `${path}/config/variable/upload`, // 上传变量包
  queryParamList: `${path}/config/variable/query`, // 查询变量列表
  deleteParam: `${path}/config/variable/delete`, // 删除变量
  getParam: `${path}/config/variable/get`, // 获取单个变量
  downloadParam: `${path}/config/variable/download`, // 下载变量
  queryActivityStaffList: `${path}/user/query/queryActivityStaffList`, // 流程中人员选择
  queryActivityStaffListNew: `${path}/user/query/queryActivityStaffListNew`, // 流程中人员选择
  get_srv_items: `${path}/srv_items/get`, // 获取服务详情
  server_first_activity: `${path}/record/ticket/first_activity`, // 获取服务的第一环节信息
  queryUserAndDepartFields: `${path}/config/field/queryUserAndDepartFields`, // 部门字段
  SERVICENORMALCREATR: `${path}/record/normal/create`, // 服务创建工单na
  SERVICETICKETCREATE: `${path}/record/ticket/create`, // 服务创建工单na
  query_srvcats: `${path}/srvcats/query`, // 获取可以创建的服务
  SERVICEITEMS_BY_CATLOG: `${path}/srv_items/query_by_catlog`, // 获取服务目录下的服务项
  GETTICKETCRAFTS: `${path}/ticket/getTicketCrafts`, // 获取草稿列表,
  queryAllResType: `${path}/res/queryAllResType`, // 查询所有资产类型
  queryCis: `${path}/res/queryCis`, // 根据资源类型查询配置项（配置项为单选时调用）
  querySpecifyFields: `${path}/config/field/querySpecifyFields`, // 根据特殊条件查询字段（列如配置项）
  queryCiAttributes: `${path}/res/queryCiAttributes`, // 根据特殊条件查询字段（列如配置项）
  queryCiAttributeColumn: `${path}/res/queryCiAttributeColumn`, // 根据特殊条件查询字段（列如配置项）
  importAdvancedModel: `${path}/config/model/importAdvancedModel`, // 导入模型
  exportAdvancedModel: `${path}/config/model/exportAdvancedModel`, // 导出模型
  getChartUrl: `${path}/res/getChartUrl`, // 获取资源图的url
  queryChartSandbox: `${path}/res/queryChartSandbox`, // 查询图的沙箱任务
  querySceneTypes: `${path}/config/model/querySceneTypes`, // 获取场景类型
  // isShowActivity: `${path}/config/model/isShowActivity`, // 是否展示自动交付节点
  getTriggerList: `${path}/config/trigger/getTriggerList`, // 获取触发器列表
  deleteTrigger: (id) => `${path}/config/trigger/delete/${id}`, // 删除触发器
  changeStatusTrigger: `${path}/config/trigger/changeStatus`, // 改变触发器状态
  getAllTriggerRecord: `${path}/config/trigger/getAllTriggerRecord`, // 获取触发记录列表
  deleteTriggerRecord: `${path}/config/trigger/deleteTriggerRecord`, // 批量删除触发器的处理记录
  EXPORTRECORD: `${path}/config/trigger/exportTriggerRecord`, // 导出处理记录
  getTicketCrafts: `${path}/ticket/getTicketCrafts`,
  deleteTicketCache: (id) => `${path}/ticket/deleteTicketCache/${id}`,
  WORKUPLOAD: `${path}/ticket/upload`, // 导入工单列表
  EXPORT_TICKET_TEMPLATE: `${path}/ticket/exportTicketTemplate`, // 导入工单列表模板
  GETTICKETSERVICE: `${path}/record/base_param/query`, // 获取服务详情
  EXPORT_PROGRESS: (id) => `${path}/ticket/getImportProgress/${id}`, // 获取导入工单的进度
  isShowDelete: `${path}/ticket/isShowDelete`, // 是否是删除工单的权限
  getAllColumns: `${path}/config/field/getAllColumns`, // 获取所有字段（分类的）
  getAllViewName: `${path}/ticket/getAllViewName`, // 获取所有试图列表
  deleteQueryView: `${path}/ticket/deleteQueryView`, // 删除视图
  updateViewName: `${path}/ticket/updateViewName`, // 更新视图名称
  saveQueryView: `${path}/ticket/saveQueryView`, // 保存视图名称
  getQueryView: `${path}/ticket/getQueryView`, // 获取视图详情
  EXPORT: `${path}/ticket/export`, // 导出工单
  BATCH_DELETE: `${path}/ticket/batchDeleteTickets`, // 批量删除工单
  retryJob: `${path}/ticket/retryJob`, // 自动交付节点出现问题后，刷新重试
  updateExecutionResult: `${path}/ticket/updateExecutionResult`, // 自动交付节点 按钮点击
  queryApproveCount: `${path}/approve/queryApproveCount`, // 获取审阅工单数量
  getExportProgress: `${path}/ticket/getExportProgress`, // 获取导出工单的进度
  getExportExcel: `${path}/ticket/getExportExcel`, // 导出工单的地址
  getPolicyList: `${path}/sla/strategy/query`, // 获取sla策略列表
  changePolicyStatus: `${path}/sla/strategy/status/change`, // 修改SLA策略的启用状态
  deletePolicyItem: `${path}/sla/strategy/delete`, // 删除SLA策略
  get_strategy_records: `${path}/sla/strategy/records`, // 获取SLA触发记录列表
  get_strategy_record_header: `${path}/sla/strategy/record_header`, // 获取SLA触发记录的SLA定义信息
  get_sla_count: `${path}/sla/count`, // 获取SLA定义的状态数据
  get_sla_definition_list: `${path}/sla/query_pagy`, // 获取SLA定义列表
  delete_sla_definition_item: `${path}/sla/delete`, // 删除SLA定义
  query_time_policy: `${path}/srv_items/time_policy/query`, // 查询时间策略
  get_sla_definition_detail: `${path}/sla/get`, // 获取sla定义详情
  update_sla_definition_detail: `${path}/sla/update`, // 更新SLA定义详情
  create_sla_definition_detail: `${path}/sla/create`, // 创建SLA定义详情
  update_timePolicy: `${path}/timePolicy/update`, // 更新SLA时间策略
  create_timePolicy: `${path}/timePolicy/create`, // 更新SLA时间策略
  timePolicy_delete: `${path}/timePolicy/delete`, // 删除sla服务时间
  CHECK_IN_TIME: `${path}/timePolicy/check_in_time`, // 检查服务项有没有在服务时间内
  queryCategory: `${path}/config/model/queryCategory`, // 查询模型类型
  get_strategy_policy: `${path}/sla/strategy/get`, // 查询sla详情
  update_strategy: `${path}/sla/strategy/update`, // 更新SLA策略
  create_strategy: `${path}/sla/strategy/create`, // 创建SLA策略
  getTriggerById: (id) => `${path}/config/trigger/getTriggerById/${id}`,
  queryConditionSelection: `${path}/config/trigger/queryConditionSelection`, // 获取三级嵌套的key
  matrixSave: `${path}/config/matrix/save`, // 保存矩阵
  getMatrixList: `${path}/config/matrix/getList`, // 获取矩阵列表
  deleteMatrix: `${path}/config/matrix/delete`, // 删除矩阵
  changeStatusMatrix: `${path}/config/matrix/changeStatus`, // 改变矩阵启用状态
  getMatrix: `${path}/config/matrix/get`, // 获取矩阵详情
  getEnableList: `${path}/config/matrix/getEnableList`, // 获取当前启用的矩阵列表
  exportMatrixRow: (id) => `${path}/config/matrix/exportMatrix?id=${id}`, // 导出矩阵（one row）
  downloadMatrixTemplate: `${path}/config/matrix/downloadMatrixTemplate`, // 下载矩阵模版，用于导入
  uploadMatrix: `${path}/config/matrix/uploadMatrix`, // 上传矩阵文件
  getImportMatrixProgress: `${path}/config/matrix/getImportMatrixProgress`, // 获取矩阵导入进度
  canDeleteMatrixColumn: `${path}/config/matrix/deleteMatrixColumn`, // 查询是否可以删除矩阵的列
  getActionListByType: (type) => `${path}/config/trigger/getActionListByType/${type}`, // 根据触发器类型获取动作列表
  getDraftsTotal: `${path}/ticket/getDraftsTotal`, // 获取草稿的数量
  getFilterType: `${path}/ticket/getFilterType`, // 获取工单数量
  getEntrustTicketCount: `${path}/ticket/getEntrustTicketCount`, // 获取委托待办数量
  isShowBatchHandle: `${path}/common/isShowBatchHandle`, // 是否显示批量处理入口
  getHandleButtons: `${path}/ticket/getHandleButtons`, // 获取批量处理按钮组
  getBatchHandleTicketList: `${path}/ticket/getBatchHandleTicketList`, // 获取批量处理列表
  getBatchActivityById: (tacheId) => `${path}/ticket/getBatchActivityById?tacheId=${tacheId}`, // 批量处理：点击提交获取环节信息
  batchHandleTicket: `${path}/ticket/batchHandleTicket`, // 提交批量处理
  getBatchHandleProgress: `${path}/ticket/getBatchHandleProgress`, // 获取批量处理状态
  queryProductPermissions: `${path}/config/depart/query_product_permissions`, // 检查菜单授权
  checkConfigAuthor: `${path}/common/checkConfigAuthor`, // 检查模型、字段、触发器、SLA管理模块 新增、删除、维护记录权限
  checkListOperation: `${path}/ticket/checkListOperation`, // 检查所有工单列表操作权限
  queryProcessedActivities: `${path}/ticket/queryProcessedActivities`, // 自由回退，查询已处理的环节(过滤特殊节点)
  listUsersWithPage: `${path}/user/query/listUsersWithPage`, // 工单评论新的获取用户的接口

  getMenuList: `${path}/config/menu/list`, // 查询工单视图所有列表
  saveMenuList: `${path}/config/menu/save`, // 新增/更新视图器和分类
  getMenuDetail: `${path}/config/menu/get`, // 获取查询器/分组详情
  menuChangeStatus: `${path}/config/menu/changeStatus`, // 查询器启停状态
  batchDelete: `${path}/config/menu/batchDelete`, // 批量删除
  getMenuGroup: `${path}/config/menu/listGroups`, // 查询所有分组
  setDefaultHome: `${path}/config/menu/setDefaultHome`, // 设为首页
  sortMenu: `${path}/config/menu/sort`, // 查询器排序接口
  getGrantedApp: `${path}/config/menu/listGrantedApp`, // 授权的产品

  getGroupListByIds: `${path}/config/userGroup/getGroupListByIds`, // 根据用户组id获取用户组信息
  getModelAndTache: `${path}/ticket/getModelAndTache`, // 获取模型数据筛选条件

  saveNodeName: `${path}/config/change/saveNodeName`, // 保存节点名称数据
  queryListWithoutPagination: `${path}/config/change/queryListWithoutPagination`, // 不分页查询所有节点数据
  queryListWithPagination: `${path}/config/change/queryListWithPagination`, // 分页查询所有节点数据
  updateNodeName: `${path}/config/change/updateNodeName`, // 更新节点数据
  deleteNodeName: (id) => `${path}/config/change/deleteNodeName?id=${id}`, // 更新节点数据

  getDepartList: `${path}/config/depart/list`, // 获取部门树
  getDirectoryList: `${path}/config/change/directory/list`, // 直接获取目录
  saveDirectory: `${path}/config/change/directory/save`, // 新建/更新变更目录
  deleteDirectory: `${path}/config/change/directory/delete`, // 删除变更目录
  directoryChangeStatus: `${path}/config/change/directory/changeStatus`, // 修改变更目录状态
  getDirectoryListByKw: `${path}/config/change/directory/listByKw`, // 在指定部门下搜索变更目录
  exportDirectory: `${path}/config/change/directory/export`, // 导出目录
  importDirectory: `${path}/config/change/directory/import`, // 导入目录
  forcedImport: `${path}/config/change/directory/forcedImport`, // 强制导入变更目录
  exportTemplate: `${path}/config/change/directory/exportTemplate`, // 导出变更目录模板
  listDepartWithDirectory: `${path}/config/change/directory/listDepartWithDirectory`, // 导出变更目录模板
  getSwitch: `${path}/config/change/getSwitch`, // 变更开关用于获取是否需要展现功能（全局的）

  getListFormTemplates: `${path}/config/model/listFormTemplates`, // 查询所有表单模板
  getlistSimpleTemplates: `${path}/config/model/listSimpleTemplates`, // 查询所有启用的模板
  changeFormTemplateStatus: (id, status) =>
    `${path}/config/model/changeFormTemplateStatus/${id}/${status}`, // 改变表单模板的启用状态
  publishFormTemplate: (id) => `${path}/config/model/publishFormTemplate/${id}`, // 表单发布为模板
  isHavePrivilege: `${path}/common/isHavePrivilege`, // 查询产品权限
  queryDepartsByIds: `${path}/config/depart/queryDepartsByIds`,
  job_relate: (id) => `${path}/job/relate/${id}`, // 关联作业
  job_delete: `${path}/job/delete`, // 删除作业计划
  job_query: `${path}/job/query`, // 查询作业计划
  getJobDetailUrl: `${path}/ticket/ext/getJobDetailUrl`, // 查询是否有作业计划
  getJobInfo: `${path}/ticket/ext/queryJobInfo`, // 查看作业进度
  resumeAndSubmit: `${path}/ticket/ext/resumeAndSubmit`, // 自动节点-恢复并流转
  generateJob: `${path}/ticket/ext/retryJob`, // 重试作业
  checkGroovy: `${path}/common/checkGroovy`, // 语法检查接口
  listBuiltinFieldParam: `${path}/config/field/listBuiltinFieldParam`, // 获取外部表单可以传递的参数
  getModelsByIds: `${path}/config/model/getModelsByIds`, // 根据模型id获取模型的详细信息
  getAuthModelsByUser: `${path}/ticket/getAuthModelsByUser`, // 获取模型列表带分页（创建用）
  getUseableModels: `${path}/config/model/getUseableModels`, // 获取模型列表带分页（查询用）
  queryFieldInfosByCodes: `${path}/config/field/queryFieldInfosByCodes`, // 根据字段code获取字段的简略信息
  getTicketFormData: `${path}/ticket/getTicketFormData`, // 获取所有工单的定制列信息
  queryModesWithPage: `${path}/config/model/queryModesWithPage`, // 分页查询模型列表
  saveModelTags: `${path}/config/model/saveModelTags`, // 保存模型的tags
  queryTags: `${path}/config/model/queryTags`, /// /保存查询tags
  isShowModelsByGroups: `${path}/common/isShowModelsByGroups`, // 点击创建工单以后判断展示哪种模式
  queryAllModels: `${path}/config/trigger/queryAllModels`, // 获取模型列表，触发器用
  queryActivityInfos: `${path}/config/trigger/queryActivityInfos`, // 获取环节列表
  getModelAndActivityInfo: `${path}/config/trigger/getModelAndActivityInfo`, // 根据模型和环节id查询名称
  listCategories: `${path}/common/listCategories`, // 权限列表类型的筛选条件下拉项
  listPermissionWithPage: `${path}/common/listPermissionWithPage`, // 数据权限列表
  updateRolePermission: `${path}/common/updateRolePermission`, // 更新数据权限
  listFieldWithPage: `${path}/config/field/listFieldWithPage`, // 分页获取内置和扩展字段
  listTicketParamFields: `${path}/config/field/listTicketParamFields`, // 分页获取工单字段
  queryFieldDetailsByCodes: `${path}/config/field/queryFieldDetailsByCodes`, //  根据code获取字段详情
  getChartVersions: `${path}/config/model/getChartVersions`, // 获取流程图版本列表
  deleteChartVersion: `${path}/config/model/deleteChartVersion`, // 删除流程图版本
  listRulesWithPage: `${path}/config/rule/listRulesWithPage`, // 分页查询规则列表
  listRuleScenes: `${path}/config/rule/listRuleScenes`, // 查询所有规则场景
  saveRuleScene: `${path}/config/rule/saveRuleScene`, // 新增/更新规则场景
  saveRule: `${path}/config/rule/saveRule`, // 新增/更新规则
  changeRuleStatus: `${path}/config/rule/changeRuleStatus`, // 启停规则
  deleteRule: `${path}/config/rule/deleteRule`, // 删除规则
  deleteRuleScene: `${path}/config/rule/deleteRuleScene`, // 删除规则场景
  saveRelation: `${path}/config/rule/saveRelation`, // 关联规则场景
  getRule: `${path}/config/rule/getRule`, // 获取规则详情
  getRuleScene: `${path}/config/rule/getRuleScene`, // 获取规则场景详情
  listRuleModelInfos: `${path}/config/rule/listRuleModelInfos`, // 查询引用的模型信息
  exportRuleTemplate: `${path}/config/rule/exportTemplate`, // 导出规则模板
  exportRule: `${path}/config/rule/export`, // 导出规则
  importRule: `${path}/config/rule/import `, // 导入规则

  queryTicketGlobal: `${path}/ticket/queryTicketByKeyword`, // 全文搜索工单
  queryTicketGlobalHistory: `${path}/ticket/querySearchHistory`, // 全文搜索input历史记录
  queryGuideInfo: `${path}/config/model/getOperationGuide`, // 获取操作指引信息

  getOutSideByCode: `${path}/config/field/getOutSideByCode`, // 获取外部数据源的下拉数据

  queryModelTypes: `${path}/config/model/queryTypeList`, // 获取模型类型列表
  createModelType: `${path}/config/model/saveModelType`, // 新增模型类型
  updateModelType: `${path}/config/model/updateModelType`, // 修改模型类型
  deleteModelType: `${path}/config/model/deleteModelType`, // 删除模型类型
  collectModel: `${path}/config/model/modelIsCollect`, // 收藏/取消收藏模型
  getCustomFieldInfos: `${path}/config/field/getCustomFieldInfos`, // 获取脚本字段列表
  queryMappingFields: `${path}/config/model/queryModelFormFields`, // 获取模型映射字段
  saveModelFieldMappings: `${path}/config/model/insertFieldMappings`, // 保存字段映射关系

  batch_shared: (shared) => `${path}/config/field/batchShared?shared=${shared}`, // 字段设置共享接口
  modelsetShared: `${path}/config/model/setShared`, // 模型设置共享接口
  slasetShared: `${path}/sla/setShared`, // sla定义设置共享接口
  listParentBusinessUnit: `${path}/config/depart/listParentBusinessUnit`, // 查询来源上级业务单位
  isExistJob: `${path}/config/model/isExistJob`, // 表单中判断自动节点是否可以侧滑打开automation页面

  getDetailTabRecordCount: `${path}/ticket/getDetailTabRecordCount`, // 获取工单详情每个tab页的数据总数

  // 权限自服务接口
  listGlobalGroups: `${path}/config/userGroup/listGlobalGroups`, // 查询用户组list
  listGroupAddableUser: `${path}/config/userGroup/listGroupAddableUser`, // 点击添加关联用户时，查询用户的接口
  listUsersByGroupId: `${path}/config/userGroup/listUsersByGroupId`, // 点击移除用户时查询接口
  listGroupAddableRole: `${path}/common/role/listGroupAddableRole`, // 点击添加角色时查询接口
  listRolesByGroupId: `${path}/common/role/listRolesByGroupId`, // 点击移除角色时查询接口
  getGroupListOfTicket: (ticketId) => `${path}/common/application/list?ticketId=${ticketId}`, // 获取当前工单关联的用户组数据
  saveAssociateGroupList: (ticketId) => `${path}/common/application/associate?ticketId=${ticketId}`, // 保存关联权限项数据
  ticketCarbonCopy: `${path}/ticket/carbonCopy`, // 工单抄送
  getTicketPrevAndNextTache: `${path}/ticket/getTicketUpAndDownTache`, // 获取上/下一环节信息
  getTicketTaskList: `${path}/ticket/getTicketTaskList`, // 获取工单改派任务
  ticketAddCounterSignPerformer: `${path}/ticket/addCounterSignPerformer`, // 工单抄送

  listDiffAppGroups: `${path}/config/userGroup/listDiffAppGroups`, // 权限范围下的所有应用
  listDiffGroupsByAppId: `${path}/config/userGroup/listDiffGroupsByAppId`, // 根据appId查询用户组
  listDiffAppGroupsByUserId: `${path}/config/userGroup/listDiffAppGroupsByUserId`, // 获取用户所在用户组
  listDiffGroupsByAppIdMulti: `${path}/config/userGroup/listDiffGroupsByAppIdMulti`, // 根据appId和用户id获取用户组

  applyModelEnableOrDisable: `${path}/config/model/applyModelEnableOrDisable`, // 发起启用/停用申请
  queryModelWaitingAuth: `${path}/config/model/queryModelWaitingAuth`, // 查询待审核模型列表
  doAuthModel: `${path}/config/model/doAuthModel`, // 执行审核
  queryModelAuthRecords: `${path}/config/model/queryModelAuthRecords`, // 查询审核记录
  deleteAuthComment: `${path}/config/model/deleteAuthComment`, // 不再显示驳回记录

  getCanAddSignNodes: (ticketId) => `${path}/ticket/getCanAddSignNodes?ticketId=${ticketId}`, // 加签功能 获取可加签模型阶段
  addDynamicNode: `${path}/ticket/addDynamicNode`, // 提交加签
  isCanListRefresh: `${path}/common/isShowRefreshButton`, // 我的待办列表是否可以手动刷新
  getTicketCountByModel: `${path}/ticket/statistics/overview/countOfTicketsByModel`, // 个人总览中各个模型对应的工单数量

  checkUserChangeAuth: `${path}/ticket/change/checkUserAuth`, // 在工单完成后是否有修改工单字段的权限
  getTicketFormDetail: `${path}/ticket/change/getTicketFormDetail`, // 获取工单表单字段列表
  getFormFieldParams: `${path}/ticket/change/getFormFieldParams`, // 获取选中的字段详情
  updateTicketForm: `${path}/ticket/change/updateTicketForm`, // 执行字段修改
  checkShowStatusButton: `${path}/config/model/checkShowStatusButton`, // 控制工单模型是否可以审批
  changeModelStatusAutomic: `${path}/config/model/changeModelStatusAutomic`, // 不需要走审批时的接口

  getMineList: `${path}/entrust/getEntrustList`, // 获取委托列表
  addEnreust: `${path}/entrust/createEntrust`, // 新增委托
  updateEntrust: `${path}/entrust/updateEntrust`, // 更新 委托
  entrustCheck: `${path}/entrust/auditEntrust`, // 委托审核
  deleteEntrust: `${path}/entrust/batchDeleteEntrust`, // 删除委托
  cancelEntrust: `${path}/entrust/cancelEntrust`, // 取消委托

  isComment: (ticketId) => `${path}/ticket/comment/check?ticketId=${ticketId}`, // 工单是否已评价
  ticketComment: (ticketId) => `${path}/ticket/comment?ticketId=${ticketId}`, // 工单评论详情
  ticketCommentSave: `${path}/ticket/comment/save`, // 工单评论保存
  saveModelFormTemplate: `${path}/ticket/saveModelFormTemplate`, // 保存模板  / 修改模板
  getModelFormTemplateList: `${path}/ticket/getModelFormTemplateList`, // 查看某模型下的模板列表
  delModelFormTemplate: `${path}/ticket/delModelFormTemplate`, // 删除模板
  getModelFormTemplate: `${path}/ticket/getModelFormTemplate`, // 查看模板详情
  queryTemplateList: `${path}/ticket/queryAllModelFormTemplateByUser`, // 模板列表

  queryAuthModelList: `${path}/config/model/queryAuthModelList`,

  collectSloth: `${path}/srv_items/srvItemIsCollect`, // 收藏/取消收藏服务目录

  quicklyRollbackTicket: `${path}/ticket/quicklyRollbackTicket`, // 快速回退
  quicklyResumeTicket: `${path}/ticket/quicklyResumeTicket`, // 快速回退后的提交
  getBaseActions: `${path}/config/trigger/getBaseActions`, // 新建委托通知列表权限
  getActionList: `${path}/config/trigger/getActionList`, // 获取通知动作
  getFileAccept: `${path}/file/getWhiteLists`, // 获取附件上传支持的文件类型

  getAuthRelatedModels: `${path}/config/model/getAuthRelateModels`, // 获取授权的关联模型
  relatedService: `${path}/config/variable/query/related-service`, // 子表单使用的变量
  saveFormLayout: `${path}/config/field/saveFormLayout`, // 新建表单分组
  updateFormLayout: `${path}/config/field/updateFormLayout`, // 修改表单分组信息
  deleteFormLayout: `${path}/config/field/deleteFormLayout`, // 删除表单分组
  queryFormLayouts: `${path}/config/field/queryFormLayouts`, // 查询分组列表

  saveDictionaryType: `${path}/dic/saveDictionary`, // 新增字典类型
  updateDictionaryType: `${path}/dic/updateDictionary`, // 更新字典类型
  queryDictionaryType: (kw) => `${path}/dic/queryDicList?kw=${kw}`, // 查询字典类型
  deleteDictionaryType: (code) => `${path}/dic/deleteDictionary?dicCode=${code}`, // 删除字典类型
  queryDictionaryData: (code) => `${path}/dic/queryDataByDicCode?dicCode=${code}`, // 查询字典类型下的数据
  batchSaveDicData: `${path}/dic/saveDictionaryDatas`, // 批量新增字典下数据
  updateDictionaryData: `${path}/dic/updateDictionaryData`, // 更新字典下数据
  updateDictionaryDataExtend: `${path}/dic/updateDictionaryDataExtend`, // 更新字典扩展属性
  deleteDictionaryData: `${path}/dic/deleteDictionaryDatas`, // 批量移除字典下数据
  queryDictionaryDataExtend: `${path}/dic/queryDictionaryDataExtend`, // 获取字典扩展属性
  queryCascadeDictionaryData: `${path}/dic/queryCascadeDictionaryData`, // 查询树形字典数据
  deleteCascadeDictionaryData: `${path}/dic/deleteCascadeDictionaryData`, // 删除树形字典数据
  queryCascadeFullDictionaryData: `${path}/dic/queryCascadeFullDictionaryData`, // 查询某个字典节点及其子节点

  queryOlaPolicyList: `${path}/ola/queryOLAPolicyList`, // 获取ola统计列表
  queryOlaProcessPolicyList: `${path}/olaProcessor/queryOLAProcessorProlicyList`, // 获取按处理组处理人计时统计ola统计列表
  deleteOLARecord: `${path}/ola/delOLAPolicyById`, // sla 删除
  deleteOLAProcessRecord: (ids) => `${path}/olaProcessor/delOLAPolicyById?ids=${ids}`, // 获取按处理组处理人计时统计ola统计列表-删除
  exportOla: `${path}/ola/exportOLA`, // 导出OLA列表
  getOlaExportProcress: `${path}/ola/getExportProgress`, // OLA导出进度
  getOlaExportExcel: `${path}/ola/getExportExcel`, // 下载导出的OLA

  querySlaRecordList: `${path}/sla/querySLARecordList`, // 获取sla统计列表
  deleteSlaRecord: `${path}/sla/deleteSlaTicketById`, // sla 删除
  exportSLA: `${path}/sla/exportSLA`, // 导出SLA统计列表
  getSlaExportProgress: `${path}/sla/getExportProgress`, // SLA导出进度
  getSlaExportExcel: `${path}/sla/getExportExcel`, // 下载导出的SLA
  getOlaProcessExport: `${path}/olaProcessor/exportOLAProcessorProlicy`, // sla列表-按处理人处理组ola-导出
  getOlaProcessExportProgress: `${path}/olaProcessor/getExportProgress`, // sla列表-按处理人处理组ola-查进度
  // getOlaProcessExcel: `${path}/olaProcessor/getExportExcel`, // sla列表-按处理人处理组ola-进度100%后调下载接口
  queryStrategyEventsByTicketId: `${path}/sla/queryStrategyEventsByTicketId`, // 获取SLA触发动作详情

  queryOlaAndSlaInfo: `${path}/ola/queryOlaAndSlaInfo`, // 获取OLA和SLA信息，用于工单详情

  queryAppAccessList: `${path}/application/queryAppAccessList`, // 获取应用列表，用于应用接入
  queryAllApp: `${path}/application/queryAllApp`, // 获取所有应用
  getAppAccess: `${path}/application/getAppAccess`, // 应用详情
  saveAppAccess: `${path}/application/saveAppAccess`, // 保存应用
  updateAppAccess: `${path}/application/updateAppAccess`, // 修改应用
  deleteAppAccess: `${path}/application/deleteAppAccess`, // 删除应用
  intoAppAccess: `${path}/application/intoAppAccess`, // 接入引用
  changeAppAccessStatus: `${path}/application/changeAppAccessStatus`, // 启用停用

  queryAllTenantList: `${path}/user/query/queryAllTenantList`, // 获取所有租户

  testTrigger: `${path}/config/trigger/testTrigger`, // 测试触发器
  checkTriggerName: (name) => `${path}/config/trigger/checkNameExists/${name}`, // 触发器名称是否重复
  saveTrigger: `${path}/config/trigger/createTrigger`, // 新建/编辑触发器

  getSwitchValue: `${path}/common/getSwitchValue`, // 开关信息(工单模板、处理记录)
  queryDepartsByUserId: `${path}/config/depart/queryDepartsByUserId`, // 根据userId获取部门
  getProcessRecordChangeList: `${path}/ticket/getProcessRecordChangeList`,
  /**
   * 远程工单
   */
  queryRemoteConfig: `${path}/remote/config/query`, // 获取配置信息
  deleteRemoteConfig: `${path}/remote/config/delete`, // 删除配置信息
  saveRemoteConfig: `${path}/remote/config/save`, // 保存配置
  queryTenantList: `${path}/remote/config/queryAllNodes`, // 获取可选租户列表
  queryModelListByNode: `${path}/remote/config/queryModelsByNode`, // 获取可选模型 params={nodeId}
  queryFieldMapping: `${path}/remote/config/queryModelFormFields`, // 获取字段映射关系
  insertFieldMapping: `${path}/remote/config/insertFieldMapping`, // 保存字段映射关系
  createRemoteTicket: `${path}/ticket/createRemoteTicket`, // 创建远程工单
  queryRemoteList: `${path}/remote/request/queryList`, // 获取远程请求列表
  acceptRequest: `${path}/remote/request/acceptRequest`, // 接收远程工单请求
  rejectRequest: `${path}/remote/request/rejectRequest`, // 驳回远程工单请求
  queryRemoteTicketRecords: `${path}/ticket/queryRemoteTicketRecords`, // 查看远程记录
  remoteTicketRollback: `${path}/ticket/ext/remoteQuicklyRollback`, // 查看远程回退
  remoteTicketRolledSubmit: `${path}/ticket/ext/remoteQuicklyResume`, // 查看远程回退后提交
  getRemoteTicketTaches: (ticketId) =>
    `${path}/ticket/ext/queryRemoteProcessedActivities?ticketId=${ticketId}`, // 查看远程记录

  /**
   * 跨租户改派
   */
  commitWithCrossUnit: `${path}/ticket/ext/commitWithCrossUnit`, // 跨租户提交
  reassignWithCrossUnit: `${path}/ticket/ext/reassignWithCrossUnit`, // 跨租户改派
  queryStaffWithCrossUnit: `${path}/user/query/queryStaffWithCrossUnit`, // 获取所有租户下的用户、用户组

  saveTableData: `${path}/ticket/ext/batchSaveTableData`, // 保存表格字段数据
  queryTableDataWithPage: `${path}/ticket/ext/queryTableDataWithPage`, // 获取表格字段数据
  queryTableDataWithPages: `${path}/ticket/ext/queryTableDataWithPages`, // 获取表格字段数据
  deleteTableData: `${path}/ticket/ext/batchDeleteTableData`, // 删除表格行
  exportTableTemplate: `${path}/export/data/exportTableTemplate`, // 导出表格字段模板
  exportTableData: `${path}/export/data/exportTableData`, // 导出表格字段
  importTable: `${path}/import/data/importTableData`, // 导入表格字段

  saveCustomOpinion: `${path}/config/system/saveCustomOpinions`, // 保存自定义意见
  deleteCustomOpinion: `${path}/config/system/deleteCustomOpinion`, // 删除自定义意见

  queryDefaultStaff: `${path}/user/query/queryDefaultStaff`, // 获取默认处理人

  queryCounterSignUserAndGroups: `${path}/ticket/queryCounterSignUserAndGroups`, // 获取会签人/组

  queryTicketModelList: `${path}/ticket/ext/queryTicketModelList`, // 工单列表查询条件-按模型过滤

  queryFieldUrgentLevel: `${path}/config/field/queryFieldUrgentLevel`, // 获取优先级配置
  queryRemoteTicketList: (ticketId, pageNo, pageSize) =>
    `${path}/remote/request/queryRelationRemoteList?ticketId=${ticketId}&pageNo=${pageNo}&pageSize=${pageSize}`,
  finishAssistTicket: `${path}/ticket/operateCoOrganizer`,
  checkRelationTicketCount: (ticketId, relationType, relationScope) =>
    `${path}/ticket/relation/queryRelationTicketCount?ticketId=${ticketId}&relationType=${relationType}&relationScope=${relationScope}`,
  queryActivityDataList: `${path}/ticket/ext/queryActivityDataList`,
  GET_TICKET_OLA_LIST: `${path}/ticket/getTicketOLAList`, // ola列表
  getTacheByModelId: `${path}/remote/config/queryModelActivityByNode`,
  saveGlobalRegularization: `${path}/config/fieldGlobalRegularization/save`, // 全局隐私字段 保存
  queryGlobalRegularization: `${path}/config/fieldGlobalRegularization/getByPage`, // 全局隐私字段 查询
  deleteGlobalRegularization: `${path}/config/fieldGlobalRegularization/removeById`, // 全局隐私字段 删除
  confirmPass: `${path}/ticket/remoteConfirmResult`,
  refreshJobPlan: `${path}/job/refreshJobPlan`, // 关联作业刷新
  remoteDockingSave: `${path}/remote/docking/save`, // 新建远程对接
  remoteDockingList: `${path}/remote/docking/list`, // 远程对接列表
  remoteDockingDelete: `${path}/remote/docking/delete`, // 删除远程对接
  remoteDockingUpdate: `${path}/remote/docking/update`, // 更新远程对接
  queryRemoteModelList: `${path}/config/model/queryRemoteModelList`, // 获取目标模型
  queryRemoteActivityList: `${path}/remote/config/queryRemoteActivityList`, // 模型环节信息
  auto_activity_jump: (ticketId, activityId) =>
    `${path}/auto/activity/jump?ticketId=${ticketId}&activityId=${activityId}`, // 自动节点跳过
  retrieveRemoteTicket: (ticketId, caseId) =>
    `${path}/ticket/retrieveRemoteTicket?ticketId=${ticketId}&caseId=${caseId}`, // 跨系统远程节点撤回
  getChildModalById: `${path}/config/model/queryChildModelForRelate`, // 获取可关联的子流程列表
  relateChildModel: `${path}/config/model/relateChildModel`, // 保存关联的子流程
  saveRelatedMappingFields: `${path}/task/config/addRelationStrategy`, // 关联任务流程时配置映射字段保存
  queryRelationStrategy: `${path}/task/config/queryRelationStrategy`, // 查询配置的映射字段
  queryRelationTaskTicket: `${path}/task/ticket/queryRelationTaskTicket`,
  deleteRelationTaskTicket: `${path}/task/ticket/deleteRelationTaskTicket`,
  sortRelationTask: `${path}/task/ticket/managerRelationOrder`,
  getTriggerMessageList: `${path}/config/system/queryMessageNotifyType`,
  getStageList: `${path}/config/model/queryModelStage`,
  getCMDBPermisssionByids: `/cmdb/serviceapi/v1/cis/sandboxes/getCIs`,
  // 数据库表接口
  queryDataSetList: `${path}/dataset/queryDataSetList`, //查询数据表列表
  createDataSet: `${path}/dataset/createDataSet`, //新建数据表
  updateDataSet: `${path}/dataset/updateDataSet`, //更新数据表
  getDataSet: `${path}/dataset/getDataSet`, //查看数据表详情
  deleteDataSet: (id) => `${path}/dataset/deleteDataSet?dataSetId=${id}`, //删除数据表
  listDataFieldWithPage: `${path}/config/field/listDataFieldWithPage`, //字段配置
  switchKeyAttribute: `${path}/config/field/switchKeyAttribute`, //切换关键属性接口
  saveDataSetItem: `${path}/dataset/saveDataSetItem`, //新增数据
  queryDataSetItem: `${path}/dataset/queryDataSetItem`, //查询数据
  updateDataSetItem: `${path}/dataset/updateDataSetItem`, //更新数据
  getDataSetItem: `${path}/dataset/getDataSetItem`, //查询详情数据
  deleteDataSetItem: (id) => `${path}/dataset/deleteDataSetItem?dataSetItemId=${id}`, //删除数据
  exportDataSheetTemplate: `${path}/dataset/exportDataSheetTemplate`, //导出模板
  importDataSheetItem: `${path}/dataset/importDataSheetItem`, //导入数据
  exportDataSheetItem: `${path}/dataset/exportDataSheetItem`, //导出数据
  DATA_PROGRESS: (id) => `${path}/dataset/getImportProgress/${id}`, // 导入进度条展示
  getTicketRestrictBtns: `${path}/ticket/getTicketOperateControl`,
  findQuoteFieldByCode: `${path}/config/field/findQuoteFieldByCode`, // 数据表引入字段详情
  querySpecifyTypeFields: `${path}/config/field/querySpecifyTypeFields`, // 数据表获取可引入的字段
  saveQuoteField: `${path}/config/field/saveQuoteField`, // 数据表保存引用字段
  updateQuoteField: `${path}/config/field/updateQuoteField`, // 数据表更新引用字段
  updateQuoteFieldSort: `${path}/config/field/updateQuoteFieldSort`, // 数据表字段配置排序
  getDataSetByCode: `${path}/dataset/getDataSetByCode`, // 数据表根据code获取数据表详情
  queryDataRow: `${path}/dataset/queryDataRow`, // 根据dataSetCode获取维护表数据
  queryFieldType: `${path}/config/field/queryFieldInfosByCodes`, // 根据字段code查字段类型
  addTaskGroup: `${path}/task/ticket/createTaskGroup`,
  delTaskGroup: (groupId) => `${path}/task/ticket/deleteTaskGroupId?groupId=${groupId}`
}
export default API
