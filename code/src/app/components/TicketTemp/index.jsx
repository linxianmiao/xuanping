import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import TempCreate from './Create'
import TempList from './List'
import TempButton from './Button'
import ManageModal from './ManageModal'
import EditModal from './EditModal'
import './index.less'

/**
 * type               工单模板类型        icon  |  list  |   button
 * modelId            模型id
 * ticketId           工单id          当其type为 list 的时候必须传
 * caseId             任务id          当其type为 list 的时候必须传
 * tacheId            环节id          当其type为 list 的时候必须传
 * fieldList          当前工单的字段列表
 * setTicketValues    设置工单中字段值的函数，类似form的setFieldsValue
 * getTicketValues    获取工单中字段值的函数，类似form的getFieldsValue
 */
@inject('ticketTemplateStore', 'templateListStore')
@observer
class TicketTemp extends Component {
  static defaultProps = {
    type: 'icon',
    fieldList: [],
    getTicketValues: () => {},
    setTicketValues: () => {}
  }

  state = {
    show: false, // 是否显示此组件，如果没有开启工单模板功能则不显示
    manageVisible: false,
    editingTemp: null,
    saveSuccessCallback: () => {}
  }

  componentDidMount() {
    this.getTicketTemplateEnable()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modelId !== this.props.modelId) {
      this.props.ticketTemplateStore.setProps({ currentTemp: null })
    }
  }

  componentWillUnmount() {
    if (this.props.type === 'list') {
      this.props.ticketTemplateStore.setProps({ currentTemp: null })
    }
  }

  getTicketTemplateEnable = () => {
    axios
      .get(API.getSwitchValue, { params: { codes: 'ticketTemplateEnable' } })
      .then((res) => this.setState({ show: res.ticketTemplateEnable === '1' }))
  }

  handleEdit = async (template) => {
    let editingTemp = template

    if (template && template.id) {
      const { getModelFormTemplate } = this.props.ticketTemplateStore
      editingTemp = await getModelFormTemplate({ id: template.id })
    }

    this.setState({ editingTemp })
  }

  _render = () => {
    const {
      type,
      modelId,
      setTicketValues,
      fieldList,
      getTicketValues,
      ticketId,
      caseId,
      tacheId,
      hideButton
    } = this.props
    switch (type) {
      case 'icon':
        return <TempCreate handleChangeTempData={this.handleEdit} />
      case 'list':
        return (
          <TempList
            modelId={modelId}
            ticketId={ticketId}
            caseId={caseId}
            tacheId={tacheId}
            fieldList={fieldList}
            setTicketValues={setTicketValues}
            getTicketValues={getTicketValues}
            handleChangeTempData={this.handleEdit}
            onManage={() => this.setState({ manageVisible: true })}
          />
        )
      case 'button':
        return <TempButton handleChangeTempData={this.handleEdit} hideButton={hideButton} />
      default:
        return ''
    }
  }

  render() {
    const { modelId, fieldList, getTicketValues } = this.props
    const { show, manageVisible, editingTemp, saveSuccessCallback } = this.state

    if (!show) {
      return null
    }

    return (
      <>
        {this._render()}

        {/* 模板管理列表弹框 */}
        <ManageModal
          visible={manageVisible}
          onEdit={(tempalte) => {
            this.setState({ saveSuccessCallback: () => this.props.templateListStore.query() })
            this.handleEdit(tempalte)
          }}
          onClose={() => this.setState({ manageVisible: false })}
        />

        {/* 模板编辑弹框 */}
        <EditModal
          template={editingTemp}
          modelId={modelId}
          fieldList={fieldList}
          getTicketValues={getTicketValues}
          saveSuccessCallback={saveSuccessCallback}
          onClose={() => {
            this.setState({
              saveSuccessCallback: null,
              editingTemp: null
            })
          }}
        />
      </>
    )
  }
}
export default TicketTemp
