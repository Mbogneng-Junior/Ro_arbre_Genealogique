package com.enspy.webtree.services;


import com.enspy.webtree.dto.requests.ConnectToFamilyDTO;
import com.enspy.webtree.dto.requests.CreateUserDto;
import com.enspy.webtree.dto.requests.LoginDTO;
import com.enspy.webtree.dto.responses.ApiResponse;
import com.enspy.webtree.models.Family;
import com.enspy.webtree.models.Users;
import com.enspy.webtree.repositories.FamilyRepository;
import com.enspy.webtree.repositories.UserRepository;
import com.enspy.webtree.utils.RandomStringGenerator;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthenticationService {

    public AuthenticationService(UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 StorageService storageService,
                                 FamilyRepository familyRepository,
                                 JWTService jwtService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.passwordEncoder = passwordEncoder;
        this.familyRepository = familyRepository;
        this.jwtService = jwtService;
    }

    private UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    private FamilyRepository familyRepository;
    private JWTService jwtService;
    private StorageService storageService;


    public String generateUsername(){
        boolean exist = true;
        String username = null;
        while (exist) {
            try {
                username = RandomStringGenerator.generateRandomString(10);

                if (userRepository.findByUsername(username).isEmpty()) {
                    exist = false;

                    if (username == null) {
                        throw new RuntimeException("Generated username is null");
                    }
                }
            } catch (Exception e) {
                exist = true;
            }
        }
        return username;
    }

    public ApiResponse createUser(CreateUserDto createUserDto, MultipartFile[] profile) {
        Users user = new Users();
        ApiResponse response = new ApiResponse();

        try {

            Optional<Users> userOpt = userRepository.findByEmail(createUserDto.getEmail());
            if (userOpt.isPresent()) {
                response.setText("email already used");
                response.setValue("409");
                return response;
            }

            String username = generateUsername();

            user.setEmail(createUserDto.getEmail());
            user.setFirstName(createUserDto.getFirstName());
            user.setLastName(createUserDto.getLastName());
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
            user.setDateOfBirth(createUserDto.getDateOfBirth());

            Users savedUser = userRepository.save(user);

            storageService.UploadMultipleFile(savedUser.getUsername(), profile);
            Optional<Users> freshUserOpt = userRepository.findById(savedUser.getId());
            if (freshUserOpt.isPresent()) {
                Users freshUser = freshUserOpt.get();

                response.setText("User created Successfully");
                response.setValue("200");
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("username", freshUser.getUsername());
                userInfo.put("name1", freshUser.getFirstName());
                userInfo.put("name2", freshUser.getLastName());
                userInfo.put("id", freshUser.getId());
                userInfo.put("password", createUserDto.getPassword()); // Mot de passe non encodé

                response.setData(userInfo);
                return response;
            } else {
                throw new RuntimeException("Could not retrieve saved user");
            }
        } catch (Exception e) {
            e.printStackTrace(); // Log complet de l'erreur
            response.setText("Error creating user: " + e.getMessage());
            response.setValue("500");
            return response;
        }
    }


    public ApiResponse login(LoginDTO loginDTO){
        ApiResponse response = new ApiResponse();
        Optional<Users> userOpt = userRepository.findByEmail(loginDTO.getEmail());
        if(userOpt.isEmpty()){
            response.setText("email not found in database");
            response.setValue("404");
            response.setData(null);
            return response;
        }
        Users user = userOpt.get();
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword()) ) {
            response.setValue("401");
            response.setText("invalid password");
            return response;
        }

        return generateToken(user);
    }

    private ApiResponse generateToken(Users user){
        ApiResponse apiError = new ApiResponse();
        Map<String, Object> map = new HashMap<>();
        map.put("BearerInfos", jwtService.generateJWT(user));

        apiError.setData(map);
        apiError.setText("User Login successfully.");
        apiError.setValue("200");
        return apiError;
    }

    private ApiResponse generateFamilyToken(Family family){
        ApiResponse apiError = new ApiResponse();
        Map<String, Object> map = new HashMap<>();
        map.put("Bearer Infos", jwtService.generateFamilyToken(family));

        apiError.setData(map);
        apiError.setText("User Login successfully.");
        apiError.setValue("200");
        return apiError;
    }

    public ApiResponse connectToFamily(ConnectToFamilyDTO connect){
        ApiResponse response = new ApiResponse();
        Optional<Family> familyOpt = familyRepository.findById(connect.getFamilyId());
        if (familyOpt.isEmpty()){
            response.setText("invalid family id");
            response.setValue("404");
            return response;
        }
        Family family = familyOpt.get();

        Optional<Users> userOpt = userRepository.findByUsername(connect.getUsername());
        if(userOpt.isEmpty()){
            response.setText("invalid username");
            response.setValue("404");
            return response;
        }

        Users user = userOpt.get();
        if(!(user.getFamilies().contains(family))){
            response.setText("user is not member of this family");
            response.setValue("401");
            return response;
        }

        return generateFamilyToken(family);
    }

}
