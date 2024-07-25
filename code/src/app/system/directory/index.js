import React from 'react'
import ButtonWrap from './buttonWrap'
import TableWrap from './tableWrap'
import OrgWrap from './orgWrap'
import { Provider } from 'mobx-react'
import DirectoryStore from './store/directoryStore'
import './styles/index.less'
import { Modal, message } from '@uyun/components'
import { autorun } from 'mobx'
import CreateDir from './createDir'
import CreateType from './createType'
const directoryStore = new DirectoryStore()
class Directory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      typeVisible: false,
      editData: {},
      dirList: []
    }
  }

  componentDidMount () {
    directoryStore.get_model_list()
    directoryStore.getDepartList('0')
    this.disposer = autorun(() => {
      const { currentOrg, kw } = directoryStore
      const data = {
        departId: currentOrg.departId || undefined
      }
      if (kw) {
        directoryStore.searchItem(directoryStore.kw)
      } else {
        directoryStore.getDirList(data)
      }
    })
    this.disposerGroup = autorun(() => {
      const { dirList } = directoryStore
      directoryStore.setParentGroupList(dirList)
    })
  }

  editItem = item => {
    if (item.type === 'GROUP') {
      this.setState({
        editData: item,
        typeVisible: true
      })
    } else {
      this.setState({
        editData: item,
        visible: true
      })
    }
  }

  changeVisible = () => {
    this.setState({
      visible: true,
      editData: {}
    })
  }

  createType = () => {
    this.setState({
      typeVisible: true,
      editData: {}
    })
  }

  onCancel =() => {
    this.setState({
      visible: false,
      typeVisible: false,
      editData: {}
    })
  }

  onSubmit = (type) => {
    this[type].props.form.validateFieldsAndScroll(async (errors, values) => {
      if (errors) return false
      // const { currentOrg } = directoryStore
      const data = _.assign({
        type: type === 'CreateDir' ? 'DIRECTORY' : 'GROUP'
        // relatedDepartId: values.relatedDepartId || currentOrg.departId
      }, values)
      const res = await directoryStore.saveDirectory(data)
      if (+res === 200) {
        const tip = values.id ? i18n('ticket.kb.edit.success', '编辑成功') : i18n('ticket.kb.success', '创建成功')
        message.success(tip)
        this.onCancel()
      }
    })
  }

  render() {
    const { editData, visible, typeVisible } = this.state
    return (
      <Provider directoryStore={directoryStore}>
        <div>
          <OrgWrap />
          <div className="right_wrap">
            <ButtonWrap />
            <TableWrap editItem={this.editItem} createType={this.createType} changeVisible={this.changeVisible} />
          </div>
          <Modal
            title={editData.id ? i18n('edit_directory', '编辑目录') : i18n('create_directory', '添加目录')}
            visible={visible}
            onCancel={this.onCancel}
            destroyOnClose
            onOk={() => { this.onSubmit('CreateDir') }}
          >
            <CreateDir wrappedComponentRef={node => { this.CreateDir = node }} editData={editData} />
          </Modal>
          <Modal
            title={editData.id ? i18n('edit_type', '编辑分类') : i18n('system.queryer.addType', '添加分类')}
            visible={typeVisible}
            onCancel={this.onCancel}
            destroyOnClose
            onOk={() => { this.onSubmit('CreateType') }}
          >
            <CreateType wrappedComponentRef={node => { this.CreateType = node }} editData={editData} />
          </Modal>
        </div>
      </Provider>
    )
  }
}
export default Directory