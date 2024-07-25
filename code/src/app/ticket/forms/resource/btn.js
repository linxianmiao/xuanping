import React, { Component } from 'react'
import { Button, Table, message } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import { store as runtimeStore } from '@uyun/runtime-react'
import CIImport from '@uyun/ec-ci-import'
import Upload from './Upload'

export default class ResourceBtn extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  showModal = async () => {
    const { resourceStore, ticketId, sandboxId } = this.props
    let newSandboxId = sandboxId
    if (!newSandboxId) {
      const res = await resourceStore.createCMDBSanbox(ticketId)
      newSandboxId = res.sandboxId
      resourceStore.setSandboxID(res.sandboxId)
    }
    if (newSandboxId) {
      await resourceStore.cmdbRepoModelClassTree()
      this.ref.current.showModal()
    } else {
      message.error('')
    }
  }

  update = async () => {
    const { querySandboxData, upDateTableDatas } = this.props
    const res = await querySandboxData()
    const tableDatas = (this.props.value || []).concat(res)
    upDateTableDatas(tableDatas)
  }

  render() {
    const {
      selectedRowKeys,
      selectedColumnKeys,
      customColumns,
      field,
      forms,
      setFieldsValue,
      onUploadComplete,
      sandboxId,
      resourceStore
    } = this.props
    const { increased, batchEdit, importOrExport } = field.useScene
    const isClick = window.location.hash.indexOf('conf/newModel') === -1
    const { permission } = resourceStore
    const { tenantId, userId } = runtimeStore.getState().user || {}

    return (
      <div className="ticket-forms-resource-btn-wrap">
        {this.props.children}
        {increased && increased.type && (
          <Button
            className="add-resource"
            onClick={() => {
              isClick && this.props.handleBtnClick('new')
            }}
            disabled={field.formType === 'ASSET' && field?.redundantAttribute?.isAssetAdd === 0}
          >
            <PlusOutlined />
            {increased.value || i18n('ticket.create.add_res', '新增配置项')}
          </Button>
        )}
        {batchEdit && batchEdit.type && (
          <Button
            disabled={_.isEmpty(selectedRowKeys)}
            onClick={() => {
              isClick && this.props.handleBtnClick('batchEdit')
            }}
          >
            {batchEdit.value || i18n('ticket.create.relate_edits', '批量编辑')}
          </Button>
        )}
        {field.formType !== 'ASSET' && importOrExport && importOrExport.type && (
          <>
            <CIImport
              sandboxId={sandboxId}
              userId={userId}
              tenantId={tenantId}
              fieldType={field.code}
              showModal={this.showModal}
              ref={this.ref}
              callback={this.update}
            >
              <Button
                onClick={(e) => {
                  if (!permission) {
                    message.error(i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作'))
                    e.stopPropagation()
                  }
                  if (this.props.type === 'preview') {
                    message.error(i18n('ticket.create.preview', '预览页面暂不支持导入操作'))
                    e.stopPropagation()
                  }
                }}
              >
                {' '}
                {i18n('import', '导入')}
              </Button>
              {/* <Tooltip title="导入">

                  <a
                    onClick={(e) => {
                      if (!permission) {
                        message.error(
                          i18n('ticket.create.disable_tip1', '您暂无CMDB权限，无法操作')
                        )
                        e.stopPropagation()
                      }
                      if (this.props.type === 'preview') {
                        message.error(i18n('ticket.create.preview', '预览页面暂不支持导入操作'))
                        e.stopPropagation()
                      }
                    }}
                  >
                    <CloudUploadOutlined />
                  </a>
                </Tooltip> */}
            </CIImport>

            <Button
              disabled={!sandboxId}
              onClick={() => {
                window.open(
                  `/cmdb/serviceapi/v1/cis/sandbox/import/exportData/file?userId=${userId}&sandboxId=${sandboxId}&tenantId=${tenantId}&fieldType=${
                    field.code
                  }&_t=${Date.now()}`,
                  '_blank'
                )
              }}
            >
              {' '}
              {i18n('export', '导出')}
            </Button>
            {/* {sandboxId ? (
              <Tooltip title="导出">

                <a
                  href={`/cmdb/serviceapi/v1/cis/sandbox/import/exportData/file?userId=${userId}&sandboxId=${sandboxId}&tenantId=${tenantId}&fieldType=${
                    field.code
                  }&_t=${Date.now()}`}
                  target="_blank"
                >
                  <CloudDownloadOutlined />
                </a>
              </Tooltip>
            ) : (
              <a style={{ cursor: 'not-allowed' }}>
                <CloudDownloadOutlined />
              </a>
            )} */}
          </>
        )}
        {field.formType === 'ASSET' &&
          field.isSingle === '1' &&
          _.get(field, 'useScene.importOrExport') && (
            <>
              {forms && !forms.commitSandbox && (
                <Upload
                  fieldType={field.code}
                  modelCode={forms.modelCode}
                  setFieldsValue={setFieldsValue}
                  onComplete={onUploadComplete}
                  type={this.props.type}
                  redundantAttribute={field?.redundantAttribute || {}}
                  ticketId={forms?.ticketId}
                  fieldId={field?.id}
                />
              )}
              <Button
                disabled={_.isEmpty(selectedRowKeys)}
                onClick={() => isClick && this.props.handleBtnClick('batchExport')}
              >
                {i18n('export', '导出')}
              </Button>
            </>
          )}

        <Table.ColumnButton
          value={selectedColumnKeys}
          checkboxGroups={[
            {
              title: i18n('conf.model.basic.allChecked', '全选'),
              key: 'all',
              checkAll: true,
              options: customColumns.map((col) => ({ label: col.name, value: col.code }))
            }
          ]}
          onChange={this.props.onColumnsChange}
        />
      </div>
    )
  }
}
