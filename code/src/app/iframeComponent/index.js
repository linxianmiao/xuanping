import React from 'react'
import globalStore from '../stores/globalStore'
class IframeComponent extends React.Component {
  render() {
    const code = this.props.match.params.code
    const { menuList: { ticketMenuList } } = globalStore
    const queryMenuView = _.filter(ticketMenuList, menu => menu.code === code)[0].queryMenuView || {}
    return <iframe
      src={queryMenuView.linkUrl}
      width="100%"
      height="100%"
      scrolling="yes"
      frameBorder={0} />
  }
}
export default IframeComponent