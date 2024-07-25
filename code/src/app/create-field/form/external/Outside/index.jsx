import React, { Component } from 'react'
import { Form } from '@uyun/components'
import DataSource from './DataSource'
import RequestType from './RequestType'
import FilterMode from './FilterMode'
import Headers from './Headers'
import QueryParams from './QueryParams'
import Body from './Body'
import ExpandValue from './ExpandValue'
import Options from './Options'
import Preview from './Preview'
import ErrorContent from './ErrorContent'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

class Outside extends Component {
  constructor(props) {
    super(props)

    const { raw, outsideUrl } = props.fieldData
    const queryParams = this.getQueryParamsFromUrl(outsideUrl)

    this.state = {
      showPreview: false, // 显示预览下拉选项
      activeKey: raw && raw.isSelect ? '1' : '0',
      queryParams
    }
  }

  getQueryParamsFromUrl = (url, queryParams = []) => {
    const nextQueryParams = queryParams.filter(item => !item.selected)

    if (!url || url.indexOf('?') < 0) {
      return nextQueryParams
    }

    const keyValuesString = url.split('?')[1]
    const keyValues = keyValuesString.split('&')

    keyValues.forEach(item => {
      const [key, value] = item.split('=')
      nextQueryParams.push({ key, value, selected: true })
    })

    return nextQueryParams
  }

  handleQueryParamsChange = data => {
    const { fieldData, onChange } = this.props
    let url = (fieldData.outsideUrl || '').split('?')[0]

    data.filter(item => item.selected).forEach((item, index) => {
      url += index === 0 ? '?' : '&'
      url += `${item.key || ''}=${item.value || ''}`
    })

    this.setState({ queryParams: data })
    // Query Params的变化同步到url
    // this.handleChange中又会设置一次queryParams，此处不能调用
    // this.handleChange(url, 'outsideUrl')
    fieldData.outsideUrl = url
    onChange(fieldData)
  }

  handleChange = (value, type) => {
    const { fieldData, onChange } = this.props

    if (type === 'body') {
      fieldData.formData = value.formData
      fieldData.raw = value.raw
    } else {
      fieldData[type] = value
    }

    if (type === 'requestType' && value === 'post') {
      if (!fieldData.formData) {
        fieldData.formData = { data: [], isSelect: 0 }
      }
      if (!fieldData.raw) {
        fieldData.raw = { data: null, isSelect: 0 }
      }
    }

    onChange(fieldData)

    // url的变化同步到Query Params
    if (type === 'outsideUrl') {
      this.setState(prevState => {
        return {
          queryParams: this.getQueryParamsFromUrl(value, prevState.queryParams)
        }
      })
    }
  }

  // 获取参外部数据
  onAjax = () => {
    const { fieldData } = this.props
    const { formData, headers, outsideUrl, raw, requestType } = fieldData
    const params = { formData, headers, outsideUrl, raw, requestType, type: 'listSel' }
    axios.post(API.get_key_by_request, params).then(res => {
      fieldData.thirdPartData = res || []
      fieldData.expandSel = []
      fieldData.params = res || []
      this.props.onChange(fieldData)
    })
  }

  // 预览
  onView = () => {
    this.setState({ showPreview: true })
  }

  render() {
    const { fieldData } = this.props
    const { outsideUrl, requestType, headers, formData, raw, thirdPartData, expandSel, keySel, valueSel, filterMode, keyword } = fieldData
    const { queryParams, showPreview } = this.state

    // 查询外部接口是否成功。成功返回选项数组；失败返回错误文本
    const isSuccess = Array.isArray(thirdPartData)

    return (
      <div className="list-select-outside-data">
        <FormItem {...formItemLayout} label={i18n('outside_data_origin', '外部数据来源')}>
          <DataSource
            value={outsideUrl}
            onChange={value => this.handleChange(value, 'outsideUrl')}
            onAjax={this.onAjax}
          />
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('ajax_type', '请求类型')}>
          <RequestType
            value={requestType}
            onChange={value => this.handleChange(value, 'requestType')}
          />
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('filter_mode', '过滤方式')}>
          <FilterMode
            value={filterMode}
            keyword={keyword}
            onChange={value => this.handleChange(value, 'filterMode')}
            onChangeKeyword={value => this.handleChange(value, 'keyword')}
          />
        </FormItem>
        <FormItem {...formItemLayout} label={'Headers'}>
          <Headers
            value={headers || []}
            onChange={value => this.handleChange(value, 'headers')}
          />
        </FormItem>
        <FormItem {...formItemLayout} label={'Query Params'}>
          <QueryParams
            data={queryParams}
            onChange={this.handleQueryParamsChange}
          />
        </FormItem>
        {
          requestType === 'post' && (
            <FormItem {...formItemLayout} label={'Body'}>
              <Body
                formData={formData}
                raw={raw}
                onChange={value => this.handleChange(value, 'body')}
              />
            </FormItem>
          )
        }
        <FormItem {...formItemLayout} label={i18n('expand.value', '扩展值')}>
          <ExpandValue
            value={expandSel}
            data={isSuccess ? thirdPartData : []}
            onChange={value => this.handleChange(value, 'expandSel')}
          />
        </FormItem>
        {
          isSuccess && thirdPartData && thirdPartData.length > 0 && (
            <Options
              thirdPartData={thirdPartData}
              keySel={keySel}
              valueSel={valueSel}
              onChange={this.handleChange}
              onView={this.onView}
            />
          )
        }
        {
          !isSuccess && thirdPartData && (
            <FormItem {...formItemLayout} label={i18n('error.info', '错误信息')}>
              <ErrorContent data={thirdPartData} />
            </FormItem>
          )
        }
        {
          showPreview && (
            <FormItem {...formItemLayout} label={i18n('list_sel_view', '下拉效果预览')}>
              <Preview fieldData={fieldData} />
            </FormItem>
          )
        }
      </div>
    )
  }
}

export default Outside
