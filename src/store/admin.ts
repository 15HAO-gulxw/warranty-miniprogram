import { defineStore } from 'pinia'

interface AdminState {
  openid: string
  name: string
  isLoggedIn: boolean
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    openid: '',
    name: '',
    isLoggedIn: false,
  }),
  actions: {
    login(openid: string, name: string) {
      this.openid = openid
      this.name = name
      this.isLoggedIn = true
      wx.setStorageSync('admin_openid', openid)
      wx.setStorageSync('admin_name', name)
      wx.setStorageSync('admin_login_time', Date.now())
    },
    logout() {
      this.openid = ''
      this.name = ''
      this.isLoggedIn = false
      wx.removeStorageSync('admin_openid')
      wx.removeStorageSync('admin_name')
      wx.removeStorageSync('admin_login_time')
    },
    restoreFromStorage() {
      const loginTime = wx.getStorageSync('admin_login_time')
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (loginTime && Date.now() - loginTime < sevenDays) {
        this.openid = wx.getStorageSync('admin_openid') || ''
        this.name = wx.getStorageSync('admin_name') || ''
        this.isLoggedIn = !!this.openid
      }
    },
  },
})
