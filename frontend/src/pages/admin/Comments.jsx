import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../../utils/api'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'

const AdminComments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchComments()
  }, [])
  
  const fetchComments = async () => {
    try {
      const response = await api.get('/admin/comments')
      setComments(response.data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (commentId) => {
    try {
      await api.put(`/admin/comments/${commentId}/approve`)
      toast.success('Comment approved')
      fetchComments()
    } catch (error) {
      toast.error('Failed to approve comment')
    }
  }
  
  const handleReject = async (commentId) => {
    try {
      await api.put(`/admin/comments/${commentId}/reject`)
      toast.success('Comment rejected')
      fetchComments()
    } catch (error) {
      toast.error('Failed to reject comment')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comments Moderation</h1>
        <p className="text-gray-600 mt-2">Approve or reject customer reviews</p>
      </div>
      
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{comment.user?.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="primary">{comment.rating} stars</Badge>
                  {comment.status === 'pending' && (
                    <Badge variant="warning">Pending</Badge>
                  )}
                  {comment.status === 'approved' && (
                    <Badge variant="success">Approved</Badge>
                  )}
                  {comment.status === 'rejected' && (
                    <Badge variant="danger">Rejected</Badge>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{comment.comment}</p>
              {comment.status === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="success" onClick={() => handleApprove(comment._id)} icon={CheckCircle}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleReject(comment._id)} icon={XCircle}>
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AdminComments
