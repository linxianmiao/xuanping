import React, { Component, isValidElement } from 'react'
import { Form, Radio, Button, Table, Divider, Modal } from '@uyun/components'
import ModelSelect from './ModelSelect'
import AddRemoteMap from './addRemoteMap'
import TenantSelect from '~/components/RemoteTenantSelect'
import DetailRemoteMap from './detailModal'
import './index.less'

import styles from './index.module.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

export default class Config extends Component {
  state = {
    config: {
      // mode: 0,
      modelMappingInfos: []
    },
    currentRecord: {},
    addVisible: false,
    isCopy: false,
    detailVisible: false,
    searchTenantVal: '',
    searchModelVal: undefined,
    tenantStatus: {
      status: 'success',
      message: ''
    },
    remoteMapList:[],
    current: 1,
    size: 20,
    total: 0,
    loading: false
  }

  componentDidMount() {
    const { current, size } = this.state
    const query = {
      pageNo: current,
      pageSize: size
    }
    this.queryConfig(query)
  }

  queryConfig = (query) => {
    this.setState({ loading: true })
    axios.get(API.queryRemoteConfig, {params: {...query}}).then((res) => {
      if(res){
        this.setState({ remoteMapList: res.list, total: res.count, loading: false })
      }
    })
  }

  refreshList = () => {
    const { size, searchTenantVal, searchModelVal } = this.state
    const query = {
      pageNo: 1,
      pageSize: size,
      tenantIds: [searchTenantVal],
      modelIds: [searchModelVal]
    }
    this.queryConfig(query)
  }
  // handleModeChange = (value) => {
  //   const nextConfig = { ...this.state.config }

  //   // nextConfig.mode = value
  //   this.setState({ config: nextConfig })
  // }

  edit = (record, isCopy) => {
    this.setState({ addVisible: true, currentRecord: record, isCopy })
  }

  searchByTenant = (val) => {
    this.setState({ searchModelVal: undefined })
    const { size } = this.state
    let query = {
      pageNo: 1,
      pageSize: size,
      modelIds: ''
    }
    if (val) {
      this.setState({
        searchTenantVal: val.value,
        current: 1,
        tenantStatus: {
          status: 'success',
          message: ''
        }
      })
      query.tenantIds = val.value
      
    } else {
      this.setState({ searchTenantVal: '' })
    }
    this.queryConfig(query)
  }



  onDelete = (id) => {
    Modal.confirm({
      title: i18n('delete.subprocess.confirm.content'),
      content: '',
      iconType: 'question-circle',
      onOk: () => {
        axios.get(API.deleteRemoteConfig, {params: {id}}).then((res) => {
          this.refreshList()
        })
      },
      okText: i18n('delete')
    })
  }

  searchByModel = (val) => {
    const { searchTenantVal } = this.state
    if (!searchTenantVal) {
      this.setState({
        tenantStatus: {
          status: 'error',
          message: '请选择租户'
        }
      })
    } else {
      const { size, searchTenantVal } = this.state
      const query = {
        pageNo: 1,
        pageSize: size,
        tenantIds: searchTenantVal
      }
      if(val){
        this.setState({
          tenantStatus: {
            status: 'success',
            message: ''
          },
          current: 1,
          searchModelVal: val.value
        })
        query.modelIds = val.value
      }
      this.setState({ searchModelVal: undefined })
      this.queryConfig(query)
    }
  }


  render() {
    const {
      addVisible,
      currentRecord,
      isCopy,
      detailVisible,
      tenantStatus,
      searchTenantVal,
      searchModelVal,
      remoteMapList,
      loading,
      current,
      size,
      total
    } = this.state
    const columns = [
      {
        title: i18n('config.mapping.currentTenant'),
        dataIndex: 'currentNodeName',
        key: 'currentNodeName',
        width: '15%'
      },
      {
        title: i18n('config.mapping.currentModel'),
        dataIndex: 'currentModelName',
        key: 'currentModelName',
        width: '20%'
      },
      {
        title: i18n('config.mapping.targetTenant'),
        dataIndex: 'targetNodeName',
        key: 'targetNodeName',
        width: '15%'
      },
      {
        title: i18n('config.mapping.targetModel'),
        dataIndex: 'targetModelName',
        key: 'targetModelName',
        width: '20%'
      },
      {
        title: i18n('globe.operation'),
        dataIndex: '',
        key: 'operation',
        width: '30',
        render: (record) => {
          return (
            <>
              <Button
                type="link"
                onClick={() => this.setState({ detailVisible: true, currentRecord: record })}
              >
                {i18n('layout.detail')}
              </Button>
              <Divider type="vertical" />
              <Button type="link" onClick={() => this.edit(record, false)}>
                {i18n('globe.change')}
              </Button>
              <Divider type="vertical" />
              <Button type="link" onClick={() => this.onDelete(record.id)}>
                {i18n('delete')}
              </Button>

              <Divider type="vertical" />
              <Button type="link" onClick={() => this.edit(record, true)}>
                {i18n('copy')}
              </Button>
            </>
          )
        }
      }
    ]
    return (
      <div className={styles.wrapper}>
        {/* <FormItem label="级联模式">
          <RadioGroup value={mode} onChange={(e) => this.handleModeChange(e.target.value)}>
            <Radio value={0}>多租户级联</Radio>
            {/* <Radio value={1}>跨系统级联</Radio>
          </RadioGroup>
        </FormItem> */}
        <div className={styles.searchWraper}>
          <div className="user-wraper">
            <FormItem validateStatus={tenantStatus.status} help={tenantStatus.message}>
              <TenantSelect onChange={this.searchByTenant} />
            </FormItem>
          </div>
          <ModelSelect
            value={searchModelVal}
            onChange={this.searchByModel}
            nodeId={searchTenantVal}
            onNodeMiss={() =>
              this.setState({ tenantStatus: { status: 'error', message: '请选择租户' } })
            }
          />
          <Button
            type="primary"
            className={styles.buttonAdd}
            onClick={() => this.setState({ addVisible: true })}
          >
            {i18n('field_value_asset_tip1')}
          </Button>
        </div>
        <Table
          loading={loading}
          className="mappingRemoteListTable"
          columns={columns}
          dataSource={remoteMapList}
          rowKey="id"
          pagination={{
            current,
            pageSize: size,
            total,
            onShowSizeChange: (current, size)=>{
              this.setState({ current, size })
              const query = {
                pageNo: current,
                pageSize: size,
                tenantIds: searchTenantVal,
                modelIds: searchModelVal
              }
              this.queryConfig(query)
            },
            onChange: (current, size) => {
              this.setState({ current })
              const query = {
                pageNo: current,
                pageSize: size,
                tenantIds: searchTenantVal,
                modelIds: searchModelVal
              }
              this.queryConfig(query)
            }
          }}
        />
        <AddRemoteMap
          refreshList={this.refreshList}
          addVisible={addVisible}
          data={currentRecord}
          isCopy={isCopy}
          cancelModal={() => this.setState({ addVisible: false, currentRecord: {}, isCopy: false })}
        />
        <DetailRemoteMap
          data={currentRecord}
          detailVisible={detailVisible}
          cancelModal={() => this.setState({ detailVisible: false, currentRecord: {} })}
        />
      </div>
    )
  }
}
