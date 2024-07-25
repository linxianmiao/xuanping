import React, { Component } from 'react'
import { Drawer, Modal, message } from '@uyun/components'
import { toJS } from 'mobx'
import TicketTemp from '~/components/TicketTemp'
import { observer, inject, Provider } from 'mobx-react'
import CreateTicket from '../../../create-ticket/create'
import ResourceStore from '../../../ticket-list/stores/resourceStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'

@inject('createStore')
@observer
class CreateSubModel extends Component {
  state = {
    mappingFields: [] // 映射字段信息
  }

  createTicket = React.createRef()

  componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible && nextProps.visible) {
      const childModelId = nextProps.submodelItem.childModel.id
      this.props.createStore.intoCreateTicket(childModelId)
      this.resourceStore = new ResourceStore()
      this.ticketFieldJobStore = new TicketFieldJobStore()
      this.resourceStore.checkUserPermission() // 检查cmdb权限
      this.queryMappingFields({
        parModelId: nextProps.modelId,
        subModelId: childModelId,
        activityId: nextProps.activityId
      })
    }
  }

  queryMappingFields = (params) => {
    axios.get(API.queryMappingFields, { params }).then((res) => {
      const { relationFields } = res || {}

      this.setState({
        mappingFields: relationFields || []
      })
    })
  }

  handleCancel = (e) => {
    Modal.confirm({
      title: i18n('submodel-confirm-title', '您确定要关闭吗？'),
      content: i18n('submodel-confirm-content', '关闭以后填写的表单信息将会被清空'),
      getContainer: () => document.getElementById('create-submodel-forms'),
      onOk: () => {
        this.props.createStore.distory()
        this.props.handleSubmodel(false)
      }
    })
  }

  saveDrawer = (node) => {
    this.drawer = node
  }

  ticketFormsDetail = (data, type) => {
    if (type === 'get') {
      return this.createTicket.current.createForms.ticketforms.current.props.form.getFieldsValue()
    }
    try {
      this.createTicket.current.createForms.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  ticketSubModelShow = (item, submodelData = {}, type, realNodes = []) => {
    const forms = toJS(this.props.createStore.createTicket)
    this.resourceStore.postResList(submodelData.subTicketId, forms?.modelId) // 提交配置项数据
    this.props.ticketSubModelShow(item, submodelData, type, realNodes)
  }

  render() {
    const forms = toJS(this.props.createStore.createTicket)
    const { mappingFields } = this.state
    return (
      <Drawer
        outerClose={false}
        destroyOnClose
        visible={this.props.visible}
        title={this.props.submodelItem.name}
        ref={this.saveDrawer}
        style={{ zIndex: 999 }}
        onClose={this.handleCancel}
      >
        <Provider resourceStore={this.resourceStore} ticketFieldJobStore={this.ticketFieldJobStore}>
          <div>
            <div className="ticket-template-modal-style">
              <TicketTemp
                type="list"
                fieldList={_.get(forms, 'fields')}
                modelId={_.get(forms, 'modelId')}
                ticketId={_.get(forms, 'ticketId')}
                caseId={_.get(forms, 'caseId')}
                tacheId={_.get(forms, 'tacheId')}
                setTicketValues={(data) => {
                  this.ticketFormsDetail(data, 'set')
                }}
                getTicketValues={() => this.ticketFormsDetail(null, 'get')}
              />
            </div>
            <CreateTicket
              {...this.props}
              locationQuery={{}}
              forms={forms}
              mappingFields={mappingFields}
              wrappedComponentRef={this.createTicket}
              // operateType={"createTicket"}
              sourceType="subOrService"
              ticketSubModelShow={this.ticketSubModelShow}
            />
          </div>
        </Provider>
      </Drawer>
    )
  }
}

export default CreateSubModel
