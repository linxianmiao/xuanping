import React, { Component, Fragment } from 'react'
import { Table, Modal, Input, Tag, message, Alert, Button } from '@uyun/components'
import moment from 'moment'
import { observer, inject } from 'mobx-react'
import Layout from '../component/table/layout'
import Title from '../component/table/title'

const { TextArea } = Input
const ButtonGroup = Button.Group

@inject('modelListStore', 'globalStore')
@observer
class ReviewListTable extends Component {
  state = {
    currentRecord: undefined,
    comment: '',
    visible: ''
  }

  timer = null

  hoverIcon = id => {
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.setState({
        visible: id
      })
    }, 100)
  }

  hoveroutIcon = () => {
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.setState({
        visible: ''
      })
    }, 100)
  }

  onCancel = () => {
    this.setState({ modelVos: null, group: undefined })
  }

  handleRefuse = async () => {
    const { currentRecord, comment } = this.state
    if (!comment) {
      message.error('请输入驳回原因')
      return false
    }
    const doAuthParamsVoList = _.map(currentRecord, item => ({ id: item.id, authStatus: 2, comment, modelId: item.modelId }))
    const data = {
      name: '',
      sorts: 1,
      doAuthParamsVoList
    }
    const res = await this.props.modelListStore.doAuthModel(data)
    if (res === '200') {
      message.success(i18n('w200'))
      this.handleCancel()
      this.props.onQuery()
    }
  }

  handleCancel = () => { this.setState({ currentRecord: undefined, comment: '' }) }

  changeArea = e => { this.setState({ comment: e.target.value }) }

  getColumns = () => {
    const { onPass } = this.props
    const { modelExport, modelInsert, modelDelete, modelModify } = this.props.globalStore.configAuthor

    let columns = [{
      title: i18n('model_name', '模型名称'),
      dataIndex: 'name',
      width: '14%',
      render: (text, record) => {
        const { name, mode, childModel, modelId } = record
        return <Title name={name} id={modelId} mode={mode} childModel={childModel} />
      }
    },
    {
      title: i18n('conf.model.modelType', '模型类型'),
      dataIndex: 'modelTypeVo',
      // width: '8%',
      render: text => text ? text.name : ''
    }, {
      title: i18n('conf.model.field.layoutId', '分组'),
      dataIndex: 'modelLayoutInfoVo',
      // width: '13%',
      render: (text) => <Layout text={text} />
    }, {
      title: i18n('permission-applicant', '申请人'),
      dataIndex: 'applyUser'
      // width: '9%'
    }, {
      title: i18n('permission-applicantType', '申请类别'),
      dataIndex: 'applyType',
      width: '9%',
      render: (text, record) => {
        const { visible } = this.state
        return <div className="model_list_modelstatus_close_tips">
          <div className="wrap">
            <span onMouseOver={() => { this.hoverIcon(record.id) }}>{text === 1 ? '启用' : text === 2 ? '停用' : text === 3 ? '发布' : text === 4 ? '删除' : ''}</span>
            {
              record.reason
                ? <span onMouseOver={() => { this.hoverIcon(record.id) }} onMouseOut={this.hoveroutIcon}>
                  <i className="iconfont icon-gengduo-shise icon1" />
                  <div className="review_tips" style={{ display: visible === record.id ? 'block' : 'none' }} onMouseOver={() => { this.hoverIcon(record.id) }} onMouseOut={this.hoveroutIcon}>
                    <Alert message={`申请理由：${record.reason}`} type="info" />
                  </div>
                </span>
                : null
            }
          </div>
        </div>
      }
    }, {
      title: i18n('permission-application-time', '申请时间'),
      dataIndex: 'applyTime',
      // width: '10%',
      render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : ''
    }]
    if (modelExport || modelInsert || modelDelete || modelModify) {
      columns = [...columns, {
        title: i18n('operation'),
        // width: '15%',
        render: record => (
          <ButtonGroup type="link">
            <a onClick={() => onPass([record])}>{i18n('pass', '通过')}</a>
            <a onClick={() => this.setState({ currentRecord: [record] })}>{i18n('globe.refuse', '驳回')}</a>
          </ButtonGroup>
        )
      }]
    }

    return columns
  }

  render() {
    const { waitModelList, reviewQuery, waitModelTotal, loading } = this.props.modelListStore
    const { pageSize, pageNo } = reviewQuery
    const { selectedRowKeys, onSelectChange, onQuery } = this.props
    const { currentRecord, comment } = this.state

    const columns = this.getColumns()
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      total: waitModelTotal,
      current: pageNo,
      pageSize: pageSize,
      onShowSizeChange: (pageNo, pageSize) => {
        this.props.onFilterChange({ pageNo, pageSize })
        onQuery()
      },
      onChange: (pageNo, pageSize) => {
        this.props.onFilterChange({ pageNo, pageSize })
        onQuery()
      }
    }
    const rowSelection = {
      selectedRowKeys,
      columnWidth: 30,
      onChange: onSelectChange
      // getCheckboxProps: record => ({
      //   disabled: record.isShared === 1
      // })
    }

    return (
      <Fragment>
        <Table
          rowKey={record => record.id}
          loading={loading}
          columns={columns}
          dataSource={waitModelList}
          rowSelection={rowSelection}
          pagination={pagination}
        />
        <Modal
          title="驳回"
          visible={Boolean(currentRecord)}
          onOk={this.handleRefuse}
          onCancel={this.handleCancel}
        >
          <TextArea
            placeholder="请输入驳回原因"
            rows={4}
            maxLength={50}
            value={comment}
            onChange={this.changeArea} />
        </Modal>
      </Fragment>
    )
  }
}

export default ReviewListTable
