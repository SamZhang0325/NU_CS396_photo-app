from datetime import datetime


def get_display_time(timestamp):
    diff = datetime.utcnow() - timestamp
    days = diff.days

    if days == 0:
        seconds = diff.seconds
        hours = seconds // 3600
        if hours < 1:
            minutes = seconds // 60
            if seconds < 10:
                return 'just now'
            elif seconds < 60:
                return '{0} seconds ago'.format(seconds)
            else:
                return '{0} minutes ago'.format(minutes)
        elif hours == 1:
            return '1 hour ago'
        else:
            return '{0} hours ago'.format(hours)
    elif days == 1:
        return '1 day ago'
    else:
        return '{0} days ago'.format(days)
