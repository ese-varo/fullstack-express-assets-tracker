import jwt from 'jsonwebtoken'

const extractToken = (req) => {
  if (!req.headers.authorization) {
    return null
  }

  const [bearer, token] = req.headers.authorization.split(' ')
  if (bearer !== 'Bearer' || !token) {
    return null
  }

  return token
}

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // Add decoded user info to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    }

    next()
  } catch (error) {
    let message
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Refresh token expired'
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'Invalid token'
    } else {
      message = 'Invalid refresh token'
    }

    return res.status(401).json({
      status: 'error',
      message
    })
  }
}

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      })
    }

    userRole = req.user.role
    // Optional role checking
    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

// NOTE: Middleware to check if user is accessing their own resource
// Useful for operations where users should only access their own data
export const checkOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  // Allow access for admins
  if (req.user.role === 'admin') {
    return next()
  }

  const resourceUserId = parseInt(req.params.id)
  if (resourceUserId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' })
  }

  next()
}

export const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token not found'
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      })
    }

    req.refreshToken = refreshToken

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token expired'
      })
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid refresh token'
    })
  }
}
