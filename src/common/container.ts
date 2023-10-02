let _container: HTMLElement = null

export const setContainer = (containerSelector: string) => {
  _container = document.querySelector(containerSelector)
}

export const getContainer = () => _container
