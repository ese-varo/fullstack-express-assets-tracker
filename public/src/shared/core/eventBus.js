export default class EventBus {
  // TODO: review improved version
  static emit(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
}
