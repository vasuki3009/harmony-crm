package com.harmony.crm.service;

import com.harmony.crm.domain.Notification;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notifications;
    private final UserService userService;

    public NotificationService(NotificationRepository notifications, UserService userService) {
        this.notifications = notifications;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Notification> mine() {
        return notifications.findByUserIdOrderByCreatedAtDesc(userService.currentUser().getId());
    }

    public Notification markRead(String id) {
        String me = userService.currentUser().getId();
        Notification n = notifications.findById(id)
                .filter(x -> me.equals(x.getUserId()))        // users can only touch their own
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        n.setRead(true);
        return notifications.save(n);
    }

    public void markAllRead() {
        List<Notification> list = notifications.findByUserIdOrderByCreatedAtDesc(userService.currentUser().getId());
        list.forEach(n -> n.setRead(true));
        notifications.saveAll(list);
    }
}
