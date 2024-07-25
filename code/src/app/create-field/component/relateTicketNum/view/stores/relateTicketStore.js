import { action, observable, runInAction } from 'mobx'
import api from '../api/api'
import { request } from '../../utils'

export default class RelateTicketStore {
  @action.bound
  async getAllTicketListData (params) {
    return await request.post(api.getAllTicket, params)
  }
}
