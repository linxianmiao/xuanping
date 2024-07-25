import React, { Component } from 'react'
import { LeftOutlined, RightOutlined } from '@uyun/icons'
import { Button, Spin } from '@uyun/components'
import Fields from './Fields'
import MappingFields from './MappingFields'

class Transfer extends Component {
  static defaultProps = {
    parModelId: '',
    subModelId: ''
  }

  state = {
    parentList: [],
    subList: [],
    mappingList: [],
    parentSelected: [],
    subSelected: [],
    mappingSelected: [],

    loading: false
  }

  componentDidMount() {
    const {
      type,
      parNodeId,
      parModelId,
      subNodeId,
      subModelId,
      source = '',
      remoteIp = '',
      apikey = '',
      appkey = undefined
    } = this.props
    const params = { type, parNodeId, parModelId, subNodeId, subModelId }
    if (source === 'RemoteRequest') {
      params.remoteIp = remoteIp
      params.remoteApikey = apikey
      params.remoteAppkey = appkey
    }
    this.setState({ loading: true })
    axios.get(API.queryFieldMapping, { params }).then((res) => {
      const { parentFields, subFields, relationFields } = res || {}

      this.setState({
        parentList: parentFields || [],
        subList: subFields || [],
        mappingList: relationFields || [],
        loading: false
      })
    })
  }

  // 父组件调用
  getValue = () => {
    return this.state.mappingList || []
  }

  handleChange = (value, field) => {
    this.setState({
      [field]: value
    })
  }

  handleClickRight = () => {
    const { parentSelected, subSelected, mappingList } = this.state
    const {
      id: parFieldId,
      code: parFieldCode,
      name: parFieldName,
      type: parFieldType
    } = parentSelected[0]
    const {
      id: subFieldId,
      code: subFieldCode,
      name: subFieldName,
      type: subFieldType
    } = subSelected[0]
    const newMapping = {
      parFieldId,
      parFieldCode,
      parFieldName,
      parFieldType,
      subFieldId,
      subFieldCode,
      subFieldName,
      subFieldType
    }
    const nextMappingList = _.cloneDeep(mappingList)

    nextMappingList.push(newMapping)
    this.setState({
      mappingList: nextMappingList,
      parentSelected: [],
      subSelected: []
    })
  }

  handleClickLeft = () => {
    const { mappingList, mappingSelected } = this.state

    const nextMappingList = mappingList.filter(
      (item) =>
        !mappingSelected.some(
          (m) => item.parFieldCode === m.parFieldCode && item.subFieldCode === m.subFieldCode
        )
    )

    this.setState({
      mappingList: nextMappingList,
      parentSelected: [],
      subSelected: [],
      mappingSelected: []
    })
  }

  render() {
    const {
      parentList,
      subList,
      mappingList,
      parentSelected,
      subSelected,
      mappingSelected,
      loading
    } = this.state
    return (
      <Spin spinning={loading}>
        <div className="u4-transfer process-field-mapping">
          <Fields
            listStyle={{ height: 380 }}
            title={i18n('parent.process.field.list')}
            type="par"
            mappingList={mappingList}
            data={parentList}
            selected={parentSelected}
            otherSelected={subSelected}
            onSelect={(items) => this.handleChange(items, 'parentSelected')}
          />
          <Fields
            listStyle={{ height: 380, marginLeft: 10 }}
            title={i18n('sub.process.field.list')}
            type="sub"
            mappingList={mappingList}
            data={subList}
            selected={subSelected}
            otherSelected={parentSelected}
            onSelect={(items) => this.handleChange(items, 'subSelected')}
          />
          <div className="u4-transfer-operation">
            <Button
              type="primary"
              disabled={parentSelected.length === 0 || subSelected.length === 0}
              onClick={this.handleClickRight}
            >
              <RightOutlined />
            </Button>
            <Button
              type="primary"
              disabled={mappingSelected.length === 0}
              onClick={this.handleClickLeft}
            >
              <LeftOutlined />
            </Button>
          </div>
          <MappingFields
            listStyle={{ height: 380, width: 230 }}
            data={mappingList}
            selected={mappingSelected}
            onSelect={(items) => this.handleChange(items, 'mappingSelected')}
          />
        </div>
      </Spin>
    )
  }
}

export default Transfer
