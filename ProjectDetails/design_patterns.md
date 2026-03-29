# Design Patterns in Property Insurance System

This document explains the key design patterns implemented in the project and how they contribute to a clean, maintainable, and scalable architecture.

---

## 1. Repository Pattern (Data Access)
The **Repository Pattern** abstracts the data layer, allowing the business logic to interact with data without knowing the underlying implementation (EF Core).

*   **Implementation**: `IRepository<T>` and `IPolicyRequestRepository` in the `Application` layer, with concrete implementations in the `Infrastructure` layer.
*   **Example**:
    ```csharp
    public class PolicyRequestService(IRepository<PolicyRequest> repository) : IPolicyRequestService {
        // Business logic uses the repository interface
    }
    ```

## 2. Dependency Injection (DI) (Loose Coupling)
**Dependency Injection** is used to provide classes with their dependencies at runtime, rather than creating them internally.

*   **Implementation**: 
    *   **Backend**: `.NET Core`'s built-in DI container (registered in `Program.cs` and `DependencyInjection.cs`).
    *   **Frontend**: `Angular`'s DI system (using constructor injection).
*   **Example**:
    ```csharp
    // Program.cs
    builder.Services.AddScoped<IPolicyRequestService, PolicyRequestService>();
    ```

## 3. Data Transfer Object (DTO) Pattern (Decoupling)
**DTOs** are used to transfer data between the API and the Application services, protecting the primary domain entities from external exposure.

*   **Implementation**: Classes in the `Application/DTOs` folder (e.g., `CreatePolicyRequestDto`, `CalculateRiskResultDto`).
*   **Purpose**: Prevents "over-posting" and ensures only the necessary data is exchanged.

## 4. Middleware / Interceptor Pattern (Cross-Cutting Concerns)
**Middleware** and **Interceptors** are used to handle cross-cutting concerns like authentication, error handling, and logging globally.

*   **Implementation**:
    *   **Backend**: `GlobalExceptionHandler` and `JwtMiddleware` in the `API` layer.
    *   **Frontend**: `AuthInterceptor` in the `Core` folder.
*   **Example**: `GlobalExceptionHandler` catches all unhandled exceptions and returns a consistent `ProblemDetails` response.

## 5. Factory / Strategy Pattern (Business Logic)
The **Strategy Pattern** is implicitly used in the risk calculation logic, where different calculation rules are applied based on the property type.

*   **Implementation**: The `CalculateRiskAsync` method in `PolicyRequestService.cs` branches based on `FormType` (Residential, Commercial, Industrial, Contents).
*   **Benefit**: Allows for easy extension. New property types can be added with their own specific risk calculation logic.

## 6. Observable Pattern (Reactive Data Flow)
In the frontend, the **Observable Pattern** (via RxJS) is used for asynchronous data streams and state management.

*   **Implementation**: Angular services return `Observable<T>` to components.
*   **Example**:
    ```typescript
    // In service
    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(url);
    }
    ```
*   **Benefit**: This ensures the UI stays "live" and responsive to data updates (e.g., real-time notifications).

---

## Summary Table

| Pattern | Layer | Purpose |
| :--- | :--- | :--- |
| **Repository** | Infrastructure / Application | Abstract data access / Isolation |
| **Dependency Injection** | All | Decoupling and testability |
| **DTO** | API / Application | Data isolation and security |
| **Middleware** | API | Aspect-Oriented Programming (Logging/Error Handling) |
| **Strategy** | Application | Algorithmic flexibility (Risk Logic) |
| **Observable** | Frontend | Reactive programming and async data handling |
