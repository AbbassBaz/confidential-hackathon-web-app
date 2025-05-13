const languages = {
  app: {
    name: 'Confidential',
    description: 'Secure Message Sharing Platform',
    copyright: (year) => `© ${year} All rights reserved.`
  },
  nav: {
    dashboard: 'Dashboard',
    create_message: 'Create Message',
    login: 'Login',
    logout: 'Logout',
    back_to_dashboard: 'Back to Dashboard'
  },
  create: {
    title: 'Create Secure Message',
    message_label: 'Message Content',
    message_placeholder: 'Enter your confidential message here...',
    empty_message_error: 'Message content cannot be empty',
    create_failed: 'Failed to create message. Please try again.',
    create_success: {
      message_created: 'Message created successfully!'
    },
    view_limit: {
      label: 'View Limit',
      helper: 'Maximum number of times this message can be viewed'
    },
    expiration: {
      label: 'Message Expiration',
      helper: 'Time until the message expires',
      options: {
        minutes_15: '15 minutes',
        hour_1: '1 hour',
        day_1: '1 day'
      }
    },
    self_destruct: {
      label: 'Self-destruct after viewing',
      helper: 'Message will be permanently deleted after being viewed',
      timer: {
        label: 'Self-destruct Timer',
        helper: 'Time until message is deleted after first view',
        options: {
          seconds_30: '30 seconds',
          minutes_1: '1 minute',
          minutes_5: '5 minutes',
          minutes_10: '10 minutes',
          minutes_30: '30 minutes'
        }
      }
    },
    recipients: {
      email_label: 'Allowed Recipients (Email Addresses)',
      email_placeholder: 'Add recipient emails',
      email_helper: 'Only these email addresses will be able to view the message',
      domain_label: 'Allowed Domains',
      domain_placeholder: 'Add domains (e.g. @example.com)',
      domain_helper: 'Only users with these email domains will be able to view the message'
    },
    buttons: {
      copy: 'Copy',
      copy_link: 'Copy Link',
      create_another: 'Create Another Message',
      go_to_dashboard: 'Go to Dashboard',
      back_to_dashboard: 'Back to Dashboard',
      create: 'Create Secure Message',
      creating: 'Creating Message...'
    },
    shareable_link: {
      title: 'Shareable Link'
    }
  },
  recipient_validation: {
    domain_start: 'Domain must start with @',
    invalid_domain: 'Please enter a valid domain format (e.g., @example.com)',
    invalid_email: 'Please enter a valid email address',
    domain_exists: 'Domain already added',
    email_exists: 'Email already added',
    press_enter: 'Press Enter or comma to add.'
  },
  file_upload: {
    label: 'File Attachments (max 5 files, 10MB each)',
    drag_drop: {
      text: 'Drag and drop files here, or',
      browse: 'browse',
      limits: 'Up to 5 files, max 10MB each'
    },
    error: {
      file_too_large: (filename) => `File ${filename} exceeds the 10MB limit`,
      max_files: 'You can only upload up to 5 files'
    },
    remove: 'Remove'
  },
  view: {
    loading: 'Loading secure message...',
    error: {
      not_found: 'Message not found',
      load_failed: 'Failed to load message',
      expired: 'This message has expired',
      view_limit: 'This message has expired or reached its view limit',
      no_permission: 'You do not have permission to view this message',
      process_failed: 'Failed to process message view'
    },
    access: {
      title: 'Access Verification',
      subtitle: 'Please enter your email address to view this secure message.',
      email: {
        label: 'Email Address',
        placeholder: 'your@email.com'
      },
      verify_button: 'Verify Access'
    },
    secure_message: {
      title: 'Secure Message',
      view_info: {
        self_destruct: (limit) => `This message will self-destruct after viewing ${limit} time${limit !== 1 ? 's' : ''}.`,
        normal: (limit) => `This message can be viewed ${limit} time${limit !== 1 ? 's' : ''}.`,
        current_views: 'Current views:',
        self_destruct_timer: 'Self-destruct in:'
      },
      warning: {
        self_destruct: 'Warning: This message will self-destruct after viewing.',
        timer_warning: 'This message will be permanently deleted when the timer reaches zero.'
      },
      buttons: {
        view_destroy: 'View and Destroy Message',
        view: 'View Message'
      }
    },
    attachments: {
      title: 'Attachments'
    }
  }
};

export default languages; 