import React, { Component } from 'react'
import { inject, observer, Provider } from 'mobx-react'
import classnames from 'classnames'
import FormSet from '~/components/formSet'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import Footer from './footer'
import Tables from './tables'
import UserStore from '../ticket-list/stores/userStore'
import TriggerStore from '../model/store/triggerStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import './index.less'

const triggerStore = new TriggerStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()
const ticketFieldJobStore = new TicketFieldJobStore()
@inject('formSetGridStore')
@observer
export default class FormManagement extends Component {
  state = {
    fieldType: 'customize',
    previewVisible: false
  }

  componentDidMount() {
    this.props.formSetGridStore.getFieldList()
  }

  handleChangeFieldType = (fieldType) => {
    this.setState({ fieldType })
  }

  handlePreview = (previewVisible) => {
    this.setState({ previewVisible })
  }

  render() {
    const { fieldType, previewVisible } = this.state
    return (
      <Provider
        userStore={userStore}
        resourceStore={resourceStore}
        ticketFieldJobStore={ticketFieldJobStore}
        triggerStore={triggerStore}
      >
        <div className="form-management">
          <PageHeader />
          <ContentLayout style={{ padding: window.LOWCODE_APP_KEY ? 0 : 12 }}>
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <div
                className={classnames({
                  'form-management-form-set': fieldType === 'formLayout'
                })}
              >
                <FormSet
                  scene="formManagement"
                  fieldType={fieldType}
                  previewVisible={previewVisible}
                  handlePreview={this.handlePreview}
                  handleChangeFieldType={this.handleChangeFieldType}
                  customize={
                    <Tables
                      fieldType={fieldType}
                      handleChangeFieldType={this.handleChangeFieldType}
                    />
                  }
                />
              </div>
            </ErrorBoundary>
          </ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            {fieldType === 'formLayout' && (
              <Footer
                handlePreview={this.handlePreview}
                handleChangeFieldType={this.handleChangeFieldType}
              />
            )}
          </ErrorBoundary>
        </div>
      </Provider>
    )
  }
}
