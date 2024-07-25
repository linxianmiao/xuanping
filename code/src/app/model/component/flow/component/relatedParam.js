import React, { Component } from 'react'
import { Select, Button, Input } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'

class relatedParam extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataSource: []
    }
  }

  add = () => {
    const { dataSource } = this.state
    const value = {
      param: '',
      field: ''
    }
    dataSource.push(value)
    this.setState({ dataSource })
  }

  delete = (index) => {
    const { dataSource } = this.state
    dataSource.splice(index, 1)
    this.setState({ dataSource })
  }

  render() {
    const { dataSource } = this.state
    return (
      <div className="related-wrap">
        <div className="related-content">
          {_.map(dataSource, (i, index) => {
            return (
              <div className="related-item" key={index}>
                <Input style={{ width: '40%' }} value={i.param} /> ->{' '}
                <Select style={{ width: '40%' }} />
                <i
                  className="iconfont icon-shanchu"
                  onClick={() => {
                    this.delete(index)
                  }}
                />
              </div>
            )
          })}
        </div>
        <Button type="primary" className="add-trigger-btn" onClick={this.add}>
          <PlusOutlined />
          {i18n('add_param', '添加参数')}
        </Button>
      </div>
    )
  }
}
export default relatedParam
