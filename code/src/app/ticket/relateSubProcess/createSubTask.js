import React, { Component } from 'react'
import { Drawer, Modal, message } from '@uyun/components'
import { toJS } from 'mobx'
import TicketTemp from '~/components/TicketTemp'
import { observer, inject, Provider } from 'mobx-react'
import CreateTicket from '../../create-ticket/create'
import ResourceStore from '../../ticket-list/stores/resourceStore'
import permissionListStore from '~/stores/permissionListStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import CreateSubStore from './createSubStore'
const createSubStore = new CreateSubStore()

@observer
class CreateSubTask extends Component {
  state = {
    mappingFields: [] // 映射字段信息
  }

  createTicket = React.createRef()

  async componentWillReceiveProps(nextProps) {
    if (this.props.visible !== nextProps.visible && nextProps.visible) {
      this.resourceStore = new ResourceStore()
      this.ticketFieldJobStore = new TicketFieldJobStore()

      const childModelId = nextProps.submodelItem.taskModelId
      if (nextProps.draftTicketId) {
        const formData = await createSubStore.getTicketCache(nextProps.draftTicketId)
        // 检查有没有权限自服务字段
        const fieldTypes = _.map(formData.fields, (field) => field.type)
        if (fieldTypes.includes('permission')) {
          // 获取当前工单关联的用户组数据
          permissionListStore.getRelatedGroupsOfTicket(nextProps.draftTicketId)
        }

        this.resourceStore.getResList(null)
      } else {
        createSubStore.intoCreateTicket(childModelId)
        this.resourceStore.checkUserPermission() // 检查cmdb权限
        this.queryMappingFields({ relationId: nextProps.submodelItem.id })
      }
    }
  }

  queryMappingFields = (params) => {
    axios.get(API.queryRelationStrategy, { params }).then((res) => {
      const { transferFieldContrasts } = res || {}

      this.setState({
        mappingFields: transferFieldContrasts || []
      })
    })
  }

  handleCancel = (e) => {
    Modal.confirm({
      title: i18n('submodel-confirm-title', '您确定要关闭吗？'),
      content: i18n('submodel-confirm-content', '关闭以后填写的表单信息将会被清空'),
      getContainer: () => document.getElementById('create-submodel-forms'),
      onOk: () => {
        createSubStore.distory()
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

  // -----合并执行人及处理意见数据-----//
  manageData = (data) => {
    function parseDom(arg) {
      const objE = document.createElement('div')
      objE.innerHTML = arg
      return objE.childNodes
    }
    const toUserList = []
    if (!data.message) {
      data.message = ''
    }
    const matchADom = data.message.match(/<a user_id="([a-fA-F0-9]{32})" >(.*?)<\/a>/gi)
    _.map(matchADom, (dom) => {
      const aDom = parseDom(dom)
      const name = aDom[0].innerHTML
      data.message = data.message.replace(dom, name)
      toUserList.push(aDom[0].getAttribute('user_id'))
    })
    data.message = data.message.replace(/\n/g, '<br/>')
    const commentData = data
    data.message = {
      toUserList,
      content: data.message || ''
    }
    // data.modelId = this.state.forms.modelId
    return commentData
  }

  render() {
    const forms = toJS(createSubStore.createTicket)
    const { mappingFields } = this.state
    const {
      visible,
      submodelItem,
      formsData,
      ticketId,
      handleSubmodel,
      getList,
      fields,
      refreshBtns
    } = this.props
    return (
      <Drawer
        outerClose={false}
        destroyOnClose
        visible={visible}
        title={submodelItem.name}
        ref={this.saveDrawer}
        style={{ zIndex: 999 }}
        onClose={this.handleCancel}
      >
        <Provider
          resourceStore={this.resourceStore}
          ticketFieldJobStore={this.ticketFieldJobStore}
          permissionListStore={permissionListStore}
        >
          <div>
            {/* <div className="ticket-template-modal-style">
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
            </div> */}
            <CreateTicket
              {...this.props}
              createSubStore={createSubStore}
              fields={fields}
              createType="createSubTask"
              locationQuery={{}}
              forms={forms}
              formsData={formsData}
              mappingFields={mappingFields}
              wrappedComponentRef={this.createTicket}
              parentTicketId={ticketId}
              refresh={() => {
                handleSubmodel(false)
                getList()
                refreshBtns()
              }}
            />
          </div>
        </Provider>
      </Drawer>
    )
  }
}

export default CreateSubTask
