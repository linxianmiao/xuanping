import React, { Component } from 'react'
import { FileSearchOutlined } from '@uyun/icons'
import { Tooltip, Dropdown, Button } from '@uyun/components'
import { MoreOutlined } from '@uyun/icons'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import TicketTemp from '~/components/TicketTemp'
import Operations from '../ticket/operations'
import ProcessChart from '../details/processChart'
import Process from '../details/process'
import TicketGuide from '~/components/ticketGuide'
import CreateBtn from './createBtn'
import AdvancedCreateBtn from './advancedCreateBtn'
import './styles/head.less'
import * as R from 'ramda'

@inject('createStore', 'ticketStore')
@withRouter
@observer
class Head extends Component {
  state = {
    visible: false
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  renderProcessModal = () => {
    const { visible } = this.state
    const { data: processList, mode } = this.props.flowChart
    const { ticketId, tacheType, tacheNo, tacheId, modelId } = this.props.forms

    if (mode) {
      return (
        <ProcessChart
          isCreate
          ticketId={ticketId}
          tacheType={tacheType || 0}
          tacheNo={tacheNo || 0}
          tacheId={tacheId}
          modelId={modelId}
          visible={visible}
          dataSource={processList}
          hideModal={this.hideModal}
          onFullClick={this.props.onFullClick}
        />
      )
    }

    return (
      <Process
        hideModal={this.hideModal}
        processList={processList}
        detail={{ father: false }}
        visible={visible}
      />
    )
  }

  renderoverlay = () => {
    const { editUserList, random } = this.props
    const filterData = _.filter(editUserList, (item) => item.random !== random)
    const content = _.isEmpty(filterData) ? (
      <div>{i18n('ticket.create.NoBodyEditing', '无他人在编辑此工单')}</div>
    ) : (
      _.map(filterData, (item, index) => (
        <div key={index}>
          <p>{item.userName + i18n('ticket.create.Editing', '编辑中')}</p>
        </div>
      ))
    )
    return (
      <div className="more-overlay">
        {/* 操作指引 */}
        <TicketGuide
          params={{
            formId: R.pathOr(undefined, ['formId'], this.props.forms),
            modelId: R.pathOr(undefined, ['modelId'], this.props.forms)
          }}
          className="iconfont-wrap"
          operateGuide={_.get(this.props.forms, 'operateGuide')}
        />
        {/* 流程图 */}
        {!this.props.unProcessBtn && (
          <div onClick={() => this.setState({ visible: true })}>
            <i className="iconfont icon-liuchengtu" /> <span>{i18n('process', '流程图')}</span>
          </div>
        )}
        {/* 多人协同 */}
        {!_.isEmpty(filterData) && (
          <Tooltip title={content}>
            <i
              className="iconfont icon-duorenxietong zhuanzhuan"
              title={i18n('multi.person.collaboration', '多人协同')}
            />
          </Tooltip>
        )}

        <div onClick={() => this.props.handleClick('search')}>
          <FileSearchOutlined />
          <span>搜索知识</span>
        </div>
      </div>
    )
  }

  render() {
    const {
      kb,
      forms,
      setFieldsValue,
      getTicketValues,
      inContainer,
      createService = false
    } = this.props
    const processList = toJS(this.props.createStore.processList)

    const dilver = {
      forms,
      submodelItem: this.props.submodelItem,
      ticketSubModelShow: this.props.ticketSubModelShow,
      id: forms.modelId,
      ticketId: forms.ticketId,
      validate: this.props.validate,
      processList: processList,
      handOk: this.props.handOk,
      operateType: this.props.operateType,
      type: 'create',
      preview: false,
      disabled: false,
      ticketType: 'edit',
      location: this.props.location,
      getFormsValue: this.props.getFormsValue,
      onValuesChange: this.props.onValuesChange,
      handleRelateCancel: this.props.handleRelateCancel,
      ticketTemplateId: this.props.ticketTemplateId,
      sourceType: this.props.sourceType,
      draftsData: this.props.draftsData,
      startNode: true,
      // 哪里用到了这个创建工单模块，比如低代码用了source="lowcode"
      source: this.props.source,
      relateTicketList: this.props.ticketStore.relateTicket,
      mappingFields: this.props.mappingFields,
      createType: this.props.createType,
      relateSubProcessTickets: toJS(this.props.ticketStore.relateSubProcessTickets),
      createService: createService
    }
    return (
      <div className="detail-head">
        <span style={{ float: 'left' }}>{forms.modelName}</span>
        <h3>
          {forms.mode === 1 ? <AdvancedCreateBtn {...dilver} /> : <CreateBtn {...dilver} />}
          {/* 更多操作 */}
          {!inContainer && inContainer !== undefined && (
            <Operations kb={kb} onClick={this.props.handleClick} />
          )}

          {((!inContainer && inContainer !== undefined) || inContainer === 'showTemp') && (
            <TicketTemp
              type="list"
              fieldList={_.get(forms, 'fields')}
              modelId={_.get(forms, 'modelId')}
              ticketId={_.get(forms, 'ticketId')}
              caseId={_.get(forms, 'caseId')}
              tacheId={_.get(forms, 'tacheId')}
              setTicketValues={setFieldsValue}
              getTicketValues={getTicketValues}
            />
          )}
          {!inContainer && inContainer !== undefined && (
            <Dropdown
              overlay={this.renderoverlay()}
              placement="bottomRight"
              overlayClassName="create-more-btn-dropdown"
            >
              <Button className="more" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </h3>
        {this.state.visible && this.renderProcessModal()}
      </div>
    )
  }
}
export default Head
