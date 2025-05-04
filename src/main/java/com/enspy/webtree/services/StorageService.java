package com.enspy.webtree.services;


import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

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
                    new File(userPath + "/" + filename).mkdir();
                }
                storedFile = userPath + "/" + filename;

            File dest = new File(storedFile);
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (IllegalStateException e) {
            throw new RuntimeException(e);
        }
    }


    public void deleteSingleFile(String username, String fileName) {
        String userPath = this.getUserPath(username);

        if (userPath == null || userPath.isEmpty()) {
            throw new IllegalArgumentException("User path is invalid or empty");
        }

        File  targetFile = new File(userPath + "/person/" + fileName);

        if (targetFile.exists() && !targetFile.isDirectory()) {
            if (targetFile.delete()) {
                System.out.println("File deleted successfully: " + targetFile.getAbsolutePath());
            } else {
                throw new RuntimeException("Failed to delete file: " + targetFile.getAbsolutePath());
            }
        }
    }


    public ApiResponse UploadMultipleFile(String username, MultipartFile[] files) {

        Map<String, Object> map = new HashMap<>();
        ApiResponse apiError = new ApiResponse();
        if (files.length > 0) {
            Arrays.stream(files).forEach((file) -> {
                this.deleteSingleFile(username, file.getOriginalFilename());
                this.save(file, username);
                com.enspy.webtree.dto.requests.File uploaded = new com.enspy.webtree.dto.requests.File();
                uploaded.setFilename(file.getOriginalFilename());
                uploaded.setContent(file.getContentType());
                uploaded.setSize(file.getSize());
                map.put(file.getOriginalFilename(), uploaded);
            });
        }
        Optional<Users> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            apiError.setText("Account not found");
            apiError.setValue("404");
            apiError.setData(null);
        } else {
            apiError.setText("Files Uploaded Successfully");
            apiError.setValue("200");
            apiError.setData(map);
        }
        return apiError;
    }



    public List<File> getAllFilesInDirectory(String directoryName) {
        if (directoryName == null || directoryName.isEmpty()) {
            throw new IllegalArgumentException("Le nom du répertoire ne peut pas être null ou vide.");
        }
        File directory = new File(directoryName);
        if (!directory.exists()) {
            throw new IllegalArgumentException("Le répertoire spécifié n'existe pas : " + directoryName);
        }
        if (!directory.isDirectory()) {
            throw new IllegalArgumentException("Le chemin spécifié n'est pas un répertoire : " + directoryName);
        }
        File[] filesArray = directory.listFiles();
        if (filesArray == null) {
            return new ArrayList<>();
        }
        return Arrays.asList(filesArray);
    }


    public String getFileNameWithoutExtension(File file) {
        String fileName = file.getName();
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(0, lastDotIndex);
        }
        return fileName;
    }


    public ResponseEntity<Resource> getFile(String username, String fileName) {
        String userPath = this.getUserPath(username);

        if (userPath == null || userPath.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }

        File targetFile = new File(userPath + "/" + fileName);
        String[] possibleExtensions = { ".png", ".PNG", ".jpg", ".jpeg" };

        if (!targetFile.exists() || targetFile.isDirectory()) {
            for (String ext : possibleExtensions) {
                File possibleFile = new File(userPath + "/" + fileName + ext);
                if (possibleFile.exists() && !possibleFile.isDirectory()) {
                    targetFile = possibleFile;
                    break;
                }
            }
        }

        if (targetFile.exists() && !targetFile.isDirectory()) {
            try {
                String mimeType = Files.probeContentType(targetFile.toPath());
                Resource fileResource = new FileSystemResource(targetFile);

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, mimeType)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + targetFile.getName() + "\"")
                        .body(fileResource);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }
        } else {

            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }







}
