import React, { Component } from 'react'
import { Table } from '@uyun/components'
import TableFieldItem from './tableFieldItem'

export default class Compare extends Component {
  renderCategory (data, item) {
    return (
      <span>
        {
          _.map(data, function (selItem, k) {
            var obj = this.getNameColor(item.params.options, selItem)
            if (item.params && item.params.color) {
              return <span key={k} className="colorful-item" style={{ background: obj.color }}>{obj.name}</span>
            } else {
              return <span key={k} className="category-item">{obj.name}</span>
            }
          }.bind(this))
        }
      </span>
    )
  }

  renderSingleCategory (data, item) {
    var obj = this.getNameColor(item.params.options, data)
    if (item.params && item.params.color) {
      return <span className="category-item" style={{ background: obj.color }}>{obj.name}</span>
    } else {
      return <span>{obj.name}</span>
    }
  }

  renderCascader (data, item) {
    var res = []
    if (_.isString(data)) {
      var values = data.split('/')
      const renderOption = function (children, i) {
        _.map(children, child => {
          if (child.code === values[i]) {
            res.push(child.name)
            if (values[i + 1] && child.children && child.children.length > 0) {
              renderOption(child.children, i + 1)
            }
          }
        })
      }
      _.map(item.params.options, option => {
        if (option.code === values[0]) {
          res.push(option.name)
          if (values[1]) {
            renderOption(option.children, 1)
          }
        }
      })
      return res.join('/')
    } else {
      return null
    }
  }

  getNameColor (options, code) {
    var obj = {
      name: '',
      color: ''
    }
    _.map(options, function (opt) {
      if (opt.code === code) {
        obj.color = opt.color
        obj.name = opt.name
      }
    })
    return obj
  }

  columnRender (data, row, index, type) {
    var columnRender = function () {
      switch (row.attributeType) {
        case 'richText':
          return (
            <div key={type + index}>
              <div dangerouslySetInnerHTML={{ __html: data || '' }} />
            </div>
          )
        case 'multiSel':
          return <div key={type + index}>{this.renderCategory(data, row)}</div>
        case 'listSel':
          return <div key={type + index}>{this.renderSingleCategory(data, row)}</div>
        case 'singleSel':
          return <div key={type + index}>{this.renderSingleCategory(data, row)}</div>
        case 'cascader':
          return <div key={type + index}>{this.renderCascader(data, row)}</div>
        case 'user':
          return (<div key={type + index}>{data && data.map((user, i) =>
            <span key={i} className="mr10">{user.name}</span>)}</div>)
        case 'image':
          return (
            <div className="upload-list-inline ant-upload-list ant-upload-list-picture">
              {
                data && data.map((img, i) => {
                  if (img) {
                    return (
                      <div key={i} className="ant-upload-list-item ant-upload-list-item-done">
                        <div className="ant-upload-list-item-info">
                          <a href={img.url} className="ant-upload-list-item-thumbnail" target="_blank">
                            <img src={'/cmdb/' + img.url} alt={img.name} />
                          </a>
                          <span className="ant-upload-list-item-name">{img.name}</span>
                        </div>
                      </div>
                    )
                  }
                })
              }
            </div>
          )
        case 'file':
          return (
            <div className="upload-list-inline ant-upload-list ant-upload-list-text">
              {
                data && data.map((file, i) => {
                  if (file) {
                    return (
                      <div key={i} className="ant-upload-list-item ant-upload-list-item-done">
                        <div className="ant-upload-list-item-info">
                          <a href={file.url} target="_blank">
                            <i className="anticon anticon-paper-clip" />
                            <span className="ant-upload-list-item-name">{file.name}</span>
                          </a>
                        </div>
                      </div>
                    )
                  }
                })
              }
            </div>
          )
        case 'table':
          return (<TableFieldItem fields={row.params.fields} data={data} />)
        case 'zoneSelection':
        case 'reference':
          return <div>{data ? data.name : ''}</div>
        default :
          if (_.isArray(data)) {
            return _.map(data, item => item.name).toString()
          }
          if (_.isObject(data)) {
            return data.name
          }
          return <div>{(_.isString(data) || _.isNumber(data)) ? data : null}</div>
      }
    }.bind(this)
    return (
      <div className="pr ml20">
        {columnRender()}
      </div>)
  }

  render () {
    var _this = this
    var width = 80 / (this.props.sideSources.length + 1) + '%'
    const columns = [{
      title: i18n('ticket.create.colName', '属性名称'),
      width: '20%',
      dataIndex: 'attributeName'
    }]

    _.map(this.props.sideSources, item => {
      columns.push({
        title: (
          <div>
            {item.userName}
          </div>
        ),
        width: width,
        dataIndex: item.sysCode,
        render: (data, row, index) => _this.columnRender(data, row, index, item.sysCode)
      })
    })
    return (
      <div className="approval-pop">
        <Table loading={this.props.loading}
          rowKey={record => record.indexForSort}
          columns={columns}
          dataSource={this.props.sideData}
          pagination={false} />
      </div>
    )
  }
}
