// const path = '/dataexchange/frontapi/v1/database'
const api = {
  getAllTicket: '/itsm/api/v2/ticket/getAllTicket',
  getAllTicketCount: '/itsm/api/v2/ticket/getAllTicket/count',
  GET_RELATE_TICKET: '/itsm/api/v2/ticket/getRelateTicket', //  获取当前已经关联的工单列表
  DEL_RELATIONSHIP: '/itsm/api/v2/ticket/relieveRelateTicket' // 删除当前关联的工单
}
export default api
