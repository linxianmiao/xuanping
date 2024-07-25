import React, { Component } from 'react'
import { observer, Provider, inject } from 'mobx-react'
import { Spin, Button } from '@uyun/components'
import stores from './stores'
import Forms from './forms'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import './styles/createServiceTime.less'

@inject('globalStore')
@observer
class DefinitionIndex extends Component {
  static defaultProps = {
    store: stores.createDefinitionStore
  }

  constructor(props) {
    super(props)
    this.formRef = React.createRef()
    this.state = {
      btnLoading: false
    }
  }

  async componentDidMount() {
    await this.props.store.queryTimePolicy()
    if (this.props.match.params.id) {
      this.props.store.getSLA(this.props.match.params.id)
    }
  }

  componentWillUnmount() {
    this.props.store.distory()
  }

  handleSubmit = () => {
    this.formRef.current.validateFields(async (errors, values) => {
      if (errors) {
        return false
      }
      this.setState({ btnLoading: true })
      let res
      if (this.props.match.params.id) {
        res = await this.props.store.upDateSLA(
          _.assign({}, values, { id: this.props.match.params.id })
        )
      } else {
        res = await this.props.store.createSLA(values)
      }
      this.setState({ btnLoading: false })
      if (res === '200') {
        this.props.history.push('/conf/sla/definition')
      }
    })
  }

  render() {
    const { loading } = this.props.store
    const { slaModify, slaInsert } = this.props.globalStore.configAuthor
    const { btnLoading } = this.state
    const { name } = this.props.store.sla
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 10 }
    }
    const isSave = this.props.match.params.id ? slaModify : slaInsert
    return (
      <Provider {...stores}>
        <Spin spinning={loading}>
          <>
            <PageHeader />
            <ContentLayout>
              <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                <h3 style={{ padding: '15px 0' }}>
                  {name || i18n('sla_add_definition', '新增SLA')}
                </h3>
                <Forms ref={this.formRef} formItemLayout={formItemLayout} />
                {isSave && (
                  <Button
                    type="primary"
                    loading={btnLoading}
                    onClick={this.handleSubmit}
                    className="u4-col-offset-2"
                    style={{ width: 156 }}
                  >
                    {i18n('save', '保存')}
                  </Button>
                )}
              </ErrorBoundary>
            </ContentLayout>
          </>
        </Spin>
      </Provider>
    )
  }
}

export default DefinitionIndex
