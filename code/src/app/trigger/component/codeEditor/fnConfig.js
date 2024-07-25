const fnConfig = [
  {
    name: 'doHttpGet',
    content: `/**
        * http get请求
        * @param url 请求路径
        * @param headers 请求体
        * @param params 请求参数
        * @return HttpResponse对象，自行获取结果
        */
       toolMethod.doHttpGet(String url, Map<String, String> headers, Map<String, String> params);`
  },
  {
    name: 'doHttpPost',
    content: `/**
        * http post请求
        * @param url 请求路径
        * @param headers 请求体
        * @param params 请求参数
        * @return HttpResponse对象，自行获取结果
        */
    toolMethod.doHttpPost(String url, Map<String, String> headers, Map<String, Object> params)`
  },
  {
    name: 'doWebService',
    content: `/**
    * webService方法调用
    * @param params 请求入参，参数顺序与方法入参需一直，目前只支持String类型的入参，格式为：{"参数名":"参数值"}
    * @param wsdl webService地址
    * @param targetNamespace 命名空间
    * @param webServiceMthod 调用的方法名
    * @param returnType 方法返回值，建议传递，否则当存在入参时会抛出异常，不填默认String，格式形如：XMLType.XSD_STRING)
    * @param soapActionUri HTTP头SOAPAction的值，非必填
    * @param soapHeaderElement header头元素名，非必填
    * @param headers header头信息，格式为:{"请求头名":"请求头值"}，非必填
    * @return Object，直接返回Object对象，该方法中不设置返回类型
    */
   toolMethod.doWebService(Map<String, String> params, String wsdl, String targetNamespace, String webServiceMthod, QName returnType, String soapActionUri, String soapHeaderElement, Map<String, String> headers)`
  },
  {
    name: 'rollbackTicket',
    content: `/**
    * 逐级回退
    * @param userId 当前用户id
    * @param ticketId 工单id
    * @param activityId 当前节点id
    * @param caseId 实例id
    * @return boolean 执行结果
    */
   toolMethod.rollbackTicket(String userId, String ticketId, String activityId, String caseId);`
  },
  {
    name: 'reopenTicket',
    content: `/**
    * 重开工单，在执行工单关闭操作时需要调用
    * @param ticketId 工单id
    * @param userId 当前用户id
    * @param tenantId 租户id
    * @param activityId 当前节点id
    * @param caseId 实例id
    * @return boolean 执行结果
    */
   toolMethod.reopenTicket(String ticketId, String userId, String tenantId, String activityId, String caseId);`
  },
  {
    name: 'getTicketById',
    content: `/**
    * 获取工单详情
    * @param ticketId 工单id
    * @return Ticket 工单对象
    */
   toolMethod.getTicketById(String ticketId);`
  },
  {
    name: 'relateTicket',
    content: `/**
    * 关联工单
    * @param srcId 源工单id
    * @param destId 目标工单id
    * @param relationType 关联关系，不传默认3：关联工单 4：协办单
    * @return boolean 执行结果
    */
   toolMethod.relateTicket(String srcId, String destId, Integer relationType);`
  },
  {
    name: 'printLog',
    content: `/**
     * 打印日志
     * @param message 日志内容
     */
    toolMethod.printLog(String message)`
  }
]
export default fnConfig
