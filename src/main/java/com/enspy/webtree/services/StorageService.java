package com.enspy.webtree.services;


import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StorageService {

    @Autowired
    private UserRepository userRepository;

    @Value("${webtree.file-storage}")
    private String filepath;

    public String nameGenerator(int length) {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = length;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();

        return generatedString;
    }


    public String getUploadPath() {
        String uploadDir = System.getProperty("user.dir") + "/" + filepath;
        if (!new File(uploadDir).exists()) {
            new File(uploadDir).mkdir();
        }
        return uploadDir;
    }


    public String getUserPath(String username) {
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("the user not exist"));
        String folder = user.getFolder();
        String uploadDir = getUploadPath();
        if (folder == null || folder.length() == 0) {
            folder = nameGenerator(10);
            user.setFolder(folder);
            userRepository.save(user);
            new File(uploadDir + "/" + folder).mkdir();
        } else if (!Files.exists(Path.of(uploadDir + "/" + folder))) {
            new File(uploadDir + "/" + folder).mkdir();
        }
        return uploadDir + "/" + folder;
    }


    public void save(MultipartFile file, String username) {
        try {
            String userPath = getUserPath(username);
            String filename = file.getOriginalFilename();
            String storedFile = "";

                if (!Files.exists(Path.of(userPath))) {
                    new File(userPath).mkdir();
                }
                storedFile = userPath + filename;

            File dest = new File(storedFile);
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (IllegalStateException e) {
            throw new RuntimeException(e);
        }
    }



}
