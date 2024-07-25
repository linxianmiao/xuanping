import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Table, Switch, message } from '@uyun/components'
import { Link } from 'react-router-dom'
import styles from './index.module.less'
import moment from 'moment'
import classnames from 'classnames'

@inject('handleRuleStore')
@observer
export default class RuleTable extends Component {
   onChangeStatus = async (checked, id) => {
     const res = await this.props.handleRuleStore.changeRuleStatus({
       id,
       status: Number(checked)
     })
     if (+res === 200) {
       const { rules } = this.props.handleRuleStore
       this.props.handleRuleStore.setData({
         rules: {
           total: rules.total,
           list: _.map(rules.list, item => {
             if (item.id === id) {
               return _.assign({}, item, { status: Number(checked) })
             }
             return item
           })
         }
       })
     }
   }

   onDel = async (record) => {
     if (record.status) {
       return false
     }
     const res = await this.props.handleRuleStore.deleteRule(record.id)
     if (+res === 200) {
       message.success(i18n('delete_success', '删除成功'))
       this.props.handleRuleStore.getRulesWithPage()
     }
   }

   render() {
     const { ruleQuery, rules } = this.props.handleRuleStore
     const { pageNo: current, pageSize } = ruleQuery
     const { total, list } = rules
     const columns = [{
       title: i18n('name', '名称'),
       dataIndex: 'name',
       render: (text, record) => <Link
         onClick={() => { this.props.handleRuleStore.setData({ currentRule: record }) }}
         to={`/conf/handleRule/detail/${record.id}?action=edit`}>{text}</Link>
     }, {
       title: '所属规则包',
       dataIndex: 'ruleSceneNames',
       render: (text) => _.map(text, item => item.sceneName)
     }, {
       title: i18n('job-creator', '创建人'),
       dataIndex: 'creator'
     }, {
       title: i18n('config_model_createTime', '创建时间'),
       dataIndex: 'createTime',
       render: (text, record) => moment(text).format('YYYY-MM-DD HH:mm')
     }, {
       title: '关联模型',
       dataIndex: 'modelIds',
       render: (text, record) => text
         ? <a onClick={() => {
           this.props.handleChangeModel({
             modelIds: text,
             ruleId: record.id
           })
         }}>{text.length}</a>
         : 0
     }, {
       title: i18n('job-status', '状态'),
       dataIndex: 'status',
       render: (text, record) => <Switch
         checked={text === 1}
         onChange={(checked) => { this.onChangeStatus(checked, record.id) }}
       />
     }, {
       title: i18n('globe.opera', '操作'),
       render: (text, record) => {
          let exportUrl = `${API.exportRule}?ruleId=${record.id}`
          if (window.LOWCODE_APP_KEY) {
            exportUrl += `&appkey=${window.LOWCODE_APP_KEY}`
          }
          return (
            <div className={styles.tableOperation}>
              <a target="_blank" href={exportUrl}>{i18n('config.trigger.export', '导出')}</a>
              <Link
                to={`/conf/handleRule/detail/${record.id}?action=copy`}
                onClick={() => { this.props.handleRuleStore.setData({ currentRule: record }) }}
              >{i18n('copy', '复制')}</Link>
              <a
                className={classnames({
                  disabled: record.status === 1 || !_.isEmpty(record.modelIds)
                })}
                onClick={() => { this.onDel(record) }}>{i18n('delete', '删除')}</a>
            </div>
          )
       }
     }]
     const pagination = {
       current,
       pageSize,
       total,
       onShowSizeChange: (current, pageSize) => {
         this.props.listStore.setCurrentAndPageSize(1, pageSize)
         this.props.listStore.getList()
       },
       onChange: (current, pageSize) => {
         this.props.listStore.setCurrentAndPageSize(current, pageSize)
         this.props.listStore.getList()
       }
     }
     return (
       <Table
         rowKey={record => record.id}
         columns={columns}
         dataSource={toJS(list)}
         pagination={pagination}
       />
     )
   }
}