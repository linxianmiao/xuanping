import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Row, Col, Tooltip } from '@uyun/components'
import moment from 'moment'
import classnames from 'classnames'
import AttachFile from '../ticket/forms/attachfile/attachfileView'
import TableData from '../ticket/forms/table'
import Resource from '../ticket/forms/resource'
/**
 *
 * @param {默认值} defaultValue
 * @param {树的级联} treeVos
 * @param {返回的lable} labels
 */
function getTreeData (defaultValue, treeVos, labels) {
  treeVos.forEach(treeEntityVo => {
    if (defaultValue && defaultValue.indexOf(treeEntityVo.value) !== -1) {
      labels.push(treeEntityVo.label)
    }
    if (treeEntityVo.children) {
      getTreeData(defaultValue, treeEntityVo.children, labels)
    }
  })
}

class FormLooks extends Component {
    switchType = (item, forms) => {
      if (!item.hidden) {
        switch (item.type) {
          case 'singleRowText':
          case 'multiRowText':
          case 'flowNo':
            if (item.code === 'title' || item.code === 'ticketDesc') {
              return item.defaultValue !== null ? item.defaultValue : forms[item.code]
            } else {
              return item.defaultValue
            }
          case 'securityCode':
            let len = 0
            const defaultValue = item.defaultValue || ''
            len = defaultValue.length
            return '*'.repeat(len)
          case 'int':
          case 'double':
            return <span>{item.defaultValue} <span style={{ color: '#6ca4cd' }}>{item.unit}</span></span>
          case 'listSel':
          case 'business':
          case 'singleSel':
          case 'multiSel':
            if (item.defaultValue) {
              if (Array.isArray(item.defaultValue)) {
                const val = []
                item.defaultValue.forEach(a => {
                  const index = _.findIndex(item.params, ['value', a])
                  index !== -1 && val.push(item.params[index].label)
                })
                return val.join('、')
              } else {
                const currentItem = item.params.find(param => `${param.value}` === `${item.defaultValue}`)
                if (currentItem) {
                  return currentItem.label
                }
                return
              }
            } else {
              if (item.code === 'urgentLevel') {
                const currentItem = item.params.find(param => `${param.value}` === `${forms.priority}`)
                if (currentItem) {
                  return currentItem.label
                }
              }
              const val = []
              item.params.forEach(a => {
                a.select === 1 && val.push(a.label)
              })
              return val.join('、')
            }
          case 'cascader':
            const cas = []
            getTreeData(item.defaultValue, item.cascade, cas)
            return <div>{cas.join('/')}</div>
          case 'attachfile':
            const copy = _.clone(item.defaultValue)
            copy && copy.forEach(a => {
              a.url = `${API.DOWNLOAD}/${a.id}`
            })
            return <AttachFile fileList={copy} disabled />
          case 'dateTime':
            const format = item.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'
            const initialValue = item.defaultValue ? +item.defaultValue === 2 ? undefined
              : +item.defaultValue === 1 ? moment().utc(8).format(format)
                : moment(item.defaultValue).utc(8).format(format)
              : undefined
            return initialValue
          case 'user':
            let users = []
            if (item.defaultValue) {
              users = item.defaultValue
            } else if (item.currUser) {
              users = [].concat(runtimeStore.getState().user?.userId)
            }
            if (users.length !== 0) {
              return _.map(_.filter(this.props.userList, user => users.indexOf(user.userId) !== -1), user => user.userName).join(',')
            }
            return
          case 'department':
            if (item.defaultValue) {
              return _.map(_.filter(this.props.departList, depar => item.defaultValue.indexOf(depar.id) !== -1), depar => depar.name).join(',')
            }
            return
          case 'table':
            return <TableData field={item} disabled ticketType={'look'} type="detail" initialValue={item.defaultValue} />
          case 'resource':
            return <Resource
              ticketId={this.props.forms.ticketId}
              field={item} disabled ticketType={'look'} type="detail" initialValue={item.defaultValue} />
          case 'layer':
            let result
            if (item.defaultValue && item.resParams) {
              const key = Object.keys(item.resParams)
              key.every(name => {
                const arr = item.resParams[name]
                Array.isArray(arr) && arr.every(obj => {
                  if (obj.value === item.defaultValue) {
                    result = obj.label
                    return false
                  }
                  return true
                })
                if (result) {
                  return false
                }
                return true
              })
            }
            return result
          case 'richText': return <div dangerouslySetInnerHTML={{ __html: item.defaultValue || '' }} />
          case 'treeSel':
            const labels = []
            getTreeData(item.defaultValue, item.treeVos, labels)
            return <div>{labels.toString()}</div>
        }
      }
    }

    render () {
      const params = this.props.forms.params
      const formContent = []
      let tmp = []
      _.map(params, (item, index) => {
        const titleClass = classnames({
          'detail-looks-form-title': true,
          required: item.isRequired === 1
        })

        const judge = type => type === 'richText' || type === 'resource' || type === 'attachfile' || type === 'table' || type === 'asset'
        const fieldDescArr = item.fieldDesc ? _.cloneDeep(item.fieldDesc.split('\n')) : []
        const fieldDesc = <div>{_.map(fieldDescArr, (i, index) => { return <p key={index}>{i}</p> })}</div>
        const fill = num => (
          <Col key={item.code} span={num}>
            <div className={titleClass}>{item.name}
              {item.fieldDesc && <Tooltip placement="topRight" title={fieldDesc}><i className="iconfont icon-bangzhu" /></Tooltip>}：
            </div>
            <div className="detail-looks-form-content">{this.switchType(item, this.props.forms)}</div>
          </Col>
        )
        if (item.fieldLine === 1 || judge(item.type)) {
          if (tmp.length > 0) {
            formContent.push(<Row key={item.code + '0'}>{tmp}</Row>)
            tmp = []
          }
          formContent.push(
            <div key={item.code + index + '1'} style={{ display: !item.hidden ? 'block' : 'none' }}>
              <Row>{fill(24)}</Row>
            </div>
          )
        } else {
          tmp.push(
            <div
              key={item.code}
              style={{ display: !item.hidden ? 'block' : 'none' }}
            >{(fill(12))}</div>
          )
          if ((tmp.length + 1) % 3 === 0) {
            tmp.push(<div key={index} className="fen-hang" style={{ float: 'left', height: '1px', width: '100%' }} />)
          }
          if (index === (params.length - 1) && tmp.length) {
            formContent.push(<Row key={item.code + '0'}>{tmp}</Row>)
          }
        }
      })
      return <div className="ticket-detail">{formContent}</div>
    }
}
export default FormLooks
