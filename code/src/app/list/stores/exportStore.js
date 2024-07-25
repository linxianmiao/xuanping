import { action } from 'mobx'

class ExportStore {
  @action async exportTicketList (data) {
    const res = await axios.post(API.EXPORT, data)
    return res
  }

  @action async getExportProgress (exportId) {
    const res = await axios.get(API.getExportProgress, { params: { exportId } })
    return res
  }

  @action async getExportExcel (exportId, compression) {
    const res = await axios.get(API.getExportExcel, { params: { exportId, compression } })
    return res
  }
}
export default new ExportStore()
