import React, { Component } from 'react'
import { Popover, Table } from '@uyun/components'
class ChangeList extends Component {
  state = {
    changeList: []
  }
  getcolumns = (params = []) => {
    return params.map((item) => {
      return {
        title: item.label,
        dataIndex: item.value,
        key: item.value,
        render: (text, record, index) => (
          <div className="table_explain" key={index}>
            {text[1] !== text[0] ? (
              <span>
                {text[0] ? <span className="old_explain">{text[0]}</span> : null}
                {text[1] ? <span className="new_explain">{text[1]}</span> : null}
              </span>
            ) : (
              <span>{text[0] ? <span className="original_explain">{text[0]}</span> : null}</span>
            )}
          </div>
        )
      }
    })
  }

  onOpenChange = (visibile) => {
    if (visibile) {
      const { recordId } = this.props.record
      axios
        .get(API.getProcessRecordChangeList, {
          params: { ticketId: this.props.ticketId, recordId }
        })
        .then((data) => {
          this.setState({ changeList: data || [] })
        })
    }
  }

  getContent = () => {
    return (
      <div>
        {this.state.changeList.map((item, idx) => {
          return (
            <div className="explain_item" key={idx}>
              <div className="explain_content">
                <div className="t_label">{item.fieldName + '：'}</div>
                <div className="t_con">
                  {item.fieldType === 'table' && (
                    <Table
                      columns={this.getcolumns(item.params)}
                      dataSource={item.currentValue || []}
                      pagination={false}
                    />
                  )}
                  {item.fieldType === 'richText' && (
                    <div>
                      <div className="old-rich-text">{i18n('ticket.record.original', '原值')}</div>
                      <div
                        className="form-rich-text"
                        dangerouslySetInnerHTML={{ __html: item.originValue }}
                      />
                      <div className="new-rich-text">{i18n('ticket.record.current', '新值')}</div>
                      <div
                        className="form-rich-text"
                        dangerouslySetInnerHTML={{ __html: item.currentValue }}
                      />
                    </div>
                  )}
                  {['richText', 'table'].indexOf(item.fieldType) === -1 && (
                    <div>
                      {item.originLabel && (
                        <span title={item.originLabel} className="col1 span">
                          {item.originLabel}
                        </span>
                      )}
                      {item.currentLabel && (
                        <span title={item.currentLabel} className="col2 span">
                          {item.currentLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    // 查看表单更新记录 的 气泡卡片标题
    const Explain = (
      <div className="explain_item">
        <div className="explain_title">
          <div className="t_label">{i18n('ticket.record.mark', '标识')}</div>
          <div className="t_con">
            <span className="col1">{i18n('ticket.record.delContent', '该内容被删除')}</span>
            <span className="col2">{i18n('ticket.record.addContent', '该内容被添加')}</span>
          </div>
        </div>
      </div>
    )
    return (
      <div className="record-changeList">
        {
          <Popover
            title={Explain}
            content={this.getContent()}
            trigger="hover"
            placement="topLeft"
            arrowPointAtCenter
            overlayClassName="popover_record"
            onOpenChange={this.onOpenChange}
          >
            <i className="iconfont icon-biaodanguanli" />
          </Popover>
        }
      </div>
    )
  }
}

export default ChangeList
