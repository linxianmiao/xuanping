import React, { Component } from 'react'
import { Provider, observer, inject } from 'mobx-react'
import { qs } from '@uyun/utils'
import { Select, Divider, Button } from '@uyun/components'
import Fields from './fields'
import ResourceStore from '../ticket-list/stores/resourceStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import ticketChangeStore from './ticketChangeStore'
import ContentLayout from '~/components/ContentLayout'
import * as R from 'ramda'

const { Option } = Select

const resourceStore = new ResourceStore()
const ticketFieldJobStore = new TicketFieldJobStore()

@inject('globalStore', 'tableListStore')
@observer
export default class TicketChange extends Component {
  constructor(props) {
    super(props)
    // 不知为啥部署到testx环境会报R is not defined 先不用R了
    // this.params = R.pick(
    //   ['ticketId', 'modelId', 'tacheId', 'caseId'],
    //   qs.parse(this.props.location.search.slice(1))
    // )
    this.state = {
      fieldIds: [],
      open: false
    }
  }

  get store() {
    return ticketChangeStore
  }

  getQueryParamsFromLocation = (props = this.props) => {
    const ticketId = props.match.params.id
    const search = props.location.search.slice(1)
    const locationQuery = qs.parse(search)
    return { ticketId, ...locationQuery }
  }

  componentDidMount() {
    const { ticketId, modelId, tacheId, caseId } = this.getQueryParamsFromLocation()
    this.params = { ticketId, modelId, tacheId, caseId }
    this.store.getTicketFormDetail(this.params)
  }

  componentWillUnmount() {
    const { ticketId } = this.getQueryParamsFromLocation()
    this.store.reset()
    this.props.tableListStore.destory(ticketId)
  }

  handleSelectChange = (fieldIds) => {
    if (fieldIds.length < this.state.fieldIds.length) {
      const newFieldList = this.store.fieldList.filter((item) => fieldIds.includes(item.id))
      this.store.setProps({ fieldList: newFieldList })
    }
    this.setState({ fieldIds })
  }

  renderDropdown = (menu) => {
    return (
      <div>
        {menu}
        <Divider style={{ margin: '4px 0' }} />
        <div style={{ padding: '8px', cursor: 'pointer' }} onMouseDown={(e) => e.preventDefault()}>
          <Button type="primary" onClick={this.finishSelect}>
            {i18n('ok')}
          </Button>
        </div>
      </div>
    )
  }

  finishSelect = () => {
    const { fieldIds } = this.state
    const payload = { ...this.params, fieldIds }
    this.store.getFormFieldParams(payload)
    this.setState({ open: false })
  }

  handleSuccess = () => {
    this.props.history.goBack()
  }

  render() {
    const { fieldIds, open } = this.state
    const { attrList, fieldList } = this.store
    const forms = this.props.location.state || {}

    return (
      <Provider
        resourceStore={resourceStore}
        ticketChangeStore={ticketChangeStore}
        ticketFieldJobStore={ticketFieldJobStore}
      >
        <>
          <Button
            style={{ float: 'right', marginTop: 6, height: 28 }}
            onClick={() => this.props.history.goBack()}
          >
            {i18n('globe.back', '返回')}
          </Button>
          <div style={{ marginTop: 40 }}>
            <ContentLayout>
              <Select
                mode="multiple"
                optionFilterProp="children"
                style={{ width: '100%', margin: '20px 0' }}
                placeholder={i18n('please-select-field', '请选择字段')}
                onChange={this.handleSelectChange}
                dropdownRender={this.renderDropdown}
                value={fieldIds}
                open={open}
                onDropdownVisibleChange={(open) => {
                  this.setState({ open })
                }}
              >
                {attrList.map((attr) => {
                  const { fieldId, fieldName } = attr
                  return (
                    <Option key={fieldId} value={fieldId}>
                      {fieldName}
                    </Option>
                  )
                })}
              </Select>

              <Fields
                {...this.params}
                forms={forms}
                list={fieldList}
                updateTicketForm={this.store.updateTicketForm}
                onSuccess={this.handleSuccess}
              />
            </ContentLayout>
          </div>
        </>
      </Provider>
    )
  }
}
