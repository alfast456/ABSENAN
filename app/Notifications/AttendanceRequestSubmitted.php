<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttendanceRequestSubmitted extends Notification
{
    use Queueable;

    public $attendanceRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct($attendanceRequest)
    {
        $this->attendanceRequest = $attendanceRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('New Attendance Request Submitted')
                    ->line('A new attendance request has been submitted.')
                    ->line('Type: ' . $this->attendanceRequest->request_type)
                    ->line('Description: ' . $this->attendanceRequest->description)
                    ->action('View Request', url('/admin/attendance-requests'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->attendanceRequest->id,
            'request_type' => $this->attendanceRequest->request_type,
            'message' => 'New attendance request submitted by employee.',
        ];
    }
}
