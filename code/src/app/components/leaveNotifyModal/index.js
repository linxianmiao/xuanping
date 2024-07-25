import { Modal } from '@uyun/components'
export default (message, callback) => {
  Modal.confirm({
    iconType: 'exclamation-circle',
    title: i18n('conf.model.leave.route.tip', '你还有数据未保存，确认离开此页面么？'),
    onText: i18n('conf.model.leave.route.tip1', '离开'),
    onOk: () => {
      callback(true)
    },
    onCancel() {
      callback(false)
    }
  })
}
