/**
 * 管理员用户管理工具
 */

/**
 * 获取允许访问管理后台的用户列表
 */
export function getAllowedAdminUsers(): string[] {
  const users = [
    process.env.GITHUB_OWNER!, // 仓库所有者
    // 可以通过环境变量添加更多管理员
    ...(process.env.ADMIN_USERS?.split(',') || [])
  ].filter(Boolean)
  
  return users
}

/**
 * 检查用户是否有管理权限
 */
export function isAdminUser(githubUsername?: string | null): boolean {
  if (!githubUsername) return false
  
  const allowedUsers = getAllowedAdminUsers()
  return allowedUsers.includes(githubUsername)
}

/**
 * 获取当前管理员用户信息（用于日志）
 */
export function getAdminUserInfo() {
  return {
    owner: process.env.GITHUB_OWNER,
    additionalAdmins: process.env.ADMIN_USERS?.split(',') || [],
    totalAllowed: getAllowedAdminUsers().length
  }
}